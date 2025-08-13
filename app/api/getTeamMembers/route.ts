import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const querySchema = z.object({
  projectId: z.string(),
});

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const { projectId: validatedProjectId } = querySchema.parse({ projectId });

    const teamMembers = await prisma.userToProject.findMany({
      where: { 
        projectId: validatedProjectId 
      },
      include: { 
        user: true 
      }
    });

    return NextResponse.json(teamMembers, { status: 200 });
  } catch (error) {
    console.error("Get team members error:", error);
    return NextResponse.json({ error: "Failed to get team members" }, { status: 500 });
  }
}