import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    console.log("GetMeetings API called with projectId:", projectId);

    if (!projectId) {
      return NextResponse.json({ message: "Invalid projectId" }, { status: 400 });
    }

    console.log("Attempting to query meetings for projectId:", projectId);
    
    const meetings = await prisma.meeting.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    console.log("Successfully retrieved meetings:", meetings?.length || 0);
    return NextResponse.json(meetings, { status: 200 });
  } catch (error) {
    console.error("Get meetings error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json({ 
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
