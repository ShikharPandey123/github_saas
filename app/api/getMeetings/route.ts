import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ message: "Invalid projectId" }, { status: 400 });
    }

    const meetings = await prisma.meeting.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(meetings, { status: 200 });
  } catch (error) {
    console.error("Get meetings error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
