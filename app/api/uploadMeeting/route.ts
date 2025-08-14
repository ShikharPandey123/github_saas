import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const uploadMeetingSchema = z.object({
  projectId: z.string().nonempty(),
  meetingUrl: z.string().url(),
  name: z.string().nonempty(),
  publicId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, meetingUrl, name, publicId } = uploadMeetingSchema.parse(body);

    const meeting = await prisma.meeting.create({
      data: {
        projectId,
        meetingUrl,
        name,
        cloudinaryPublicId: publicId ?? null,
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
