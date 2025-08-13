import { processMeeting } from "@/lib/assembly";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  meetingUrl: z.string(),
  projectId: z.string(),
  meetingId: z.string()
});

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const{meetingUrl,meetingId} = bodyParser.parse(body);
    const {summaries} = await processMeeting(meetingUrl);
    await prisma.issue.createMany({
      data: summaries.map((summary) => ({
        start:summary.start,
        end:summary.end,
        gist:summary.gist,
        headline:summary.headline,
        summary:summary.summary,
        meetingId
      }))
    });
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { 
        status: "COMPLETED",
        name: summaries[0]!.headline || "Meeting Summary", 
      }
    });
  } catch (error) {
     console.error(error);
     return NextResponse.json({ error: "Failed to process meeting" }, { status: 500 });
  }
}