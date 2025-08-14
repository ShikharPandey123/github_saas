import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
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
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meetingId } = await params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        project: {
          userToProjects: {
            some: { userId }
          }
        }
      },
      include: {
        project: { include: { userToProjects: true } }
      }
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found or access denied" }, { status: 404 });
    }

    // 1) Try Cloudinary delete if we have a public_id
    if (meeting.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(meeting.cloudinaryPublicId, {
          resource_type: 'video',
          invalidate: true,
        });
      } catch (e) {
        console.warn('Cloudinary destroy failed (continuing):', e);
      }
    }

    // 2) Delete DB record
    const deletedMeeting = await prisma.meeting.delete({ where: { id: meetingId } });

    return NextResponse.json({
      message: "Meeting deleted successfully",
      meeting: deletedMeeting
    });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: "Failed to delete meeting", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
