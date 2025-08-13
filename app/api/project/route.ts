import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pullCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { checkCredits } from "@/lib/github-credits";

const createProjectSchema = z.object({
  githubUrl: z.string(),
  name: z.string(),
  githubToken: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.userId;
  if (!userId) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const input = createProjectSchema.parse(body);
    
    // Check file count and user credits
    const fileCount = await checkCredits(input.githubUrl, input.githubToken);
    console.log("Repository file count:", fileCount);
    
    // Get user's current credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.credits < fileCount) {
      return NextResponse.json(
        { error: `Insufficient credits. Repository has ${fileCount} files but you only have ${user.credits} credits.` },
        { status: 400 }
      );
    }

    // Use a transaction to ensure credits are deducted and project is created atomically
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credits from user
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: fileCount
          }
        }
      });

      // Create the project
      const project = await tx.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.name,
          userToProjects: {
            create: [
              {
                userId: userId,
              },
            ],
          },
        },
      });

      return project;
    });

    console.log("Project created and credits deducted:", result.id, "Credits used:", fileCount);

    // Small delay to ensure transaction is committed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Handle background operations with proper error handling
    try {
      console.log("Starting indexGithubRepo...");
      await indexGithubRepo(result.id, input.githubUrl, input.githubToken);
      console.log("indexGithubRepo completed");
    } catch (indexError) {
      console.error("Error indexing GitHub repo:", indexError);
      // Don't fail the entire operation, just log the error
    }

    try {
      console.log("Starting pullCommits...");
      await pullCommits(result.id);
      console.log("pullCommits completed");
    } catch (commitError) {
      console.error("Error pulling commits:", commitError);
      // Don't fail the entire operation, just log the error
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  const userId = session?.userId;
  if (!userId) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: userId,
          },
        },
        deletedAt: null,
        isArchived: {
          not: true,
        },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
