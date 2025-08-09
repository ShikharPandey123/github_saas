import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
    const project = await prisma.project.create({
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
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
