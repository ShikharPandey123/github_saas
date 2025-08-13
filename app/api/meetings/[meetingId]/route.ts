import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.meetingId },
      include: { issues: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: { meetingId: string } }
) {
  try {
    const deletedMeeting = await prisma.meeting.delete({
      where: { id: params.meetingId },
    });

    return NextResponse.json(deletedMeeting);
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
