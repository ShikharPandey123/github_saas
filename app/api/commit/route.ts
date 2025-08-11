import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pullCommits } from "@/lib/github";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "No projectId provided" },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userToProjects: { some: { userId } },
        deletedAt: null,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or not accessible" },
        { status: 404 }
      );
    }

    let commits = await prisma.commit.findMany({
      where: { projectId: project.id },
      orderBy: { commitDate: "desc" },
    });

    if (commits.length === 0) {
      await pullCommits(project.id);
      commits = await prisma.commit.findMany({
        where: { projectId: project.id },
        orderBy: { commitDate: "desc" },
      });
    }
    console.log("API projectId:", projectId);
    console.log("API commits:", commits);
    return NextResponse.json(commits);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch commits" },
      { status: 500 }
    );
  }
}