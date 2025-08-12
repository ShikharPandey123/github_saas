import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { projectId, meetingUrl, name } = await req.json();

    if (!projectId || !meetingUrl || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        meetingUrl,
        projectId,
        name,
        meetingDate: new Date(),
        status: "PROCESSING",
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Upload meeting error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
