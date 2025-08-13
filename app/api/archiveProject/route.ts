import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const bodyParser = z.object({
  projectId: z.string(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId } = bodyParser.parse(body);

    // Check if user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Archive the project (you can add an isArchived field to your schema)
    const archivedProject = await prisma.project.update({
      where: { id: projectId },
      data: { 
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    return NextResponse.json(archivedProject, { status: 200 });
  } catch (error) {
    console.error("Archive project error:", error);
    return NextResponse.json({ error: "Failed to archive project" }, { status: 500 });
  }
}