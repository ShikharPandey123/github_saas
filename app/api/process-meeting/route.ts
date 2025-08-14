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
    const { meetingUrl, meetingId } = bodyParser.parse(body);

    // For localhost URLs, use mock data for testing
    if (meetingUrl.includes('localhost')) {
      console.log("Using mock data for localhost file:", meetingUrl);
      
      // Create mock summaries for testing
      const mockSummaries = [
        {
          start: 0,
          end: 5000,
          gist: "Meeting introduction and agenda overview",
          headline: "Project Planning Meeting - Mock Data",
          summary: "This is a mock summary for testing purposes. The team discussed project timelines and deliverables."
        },
        {
          start: 5000,
          end: 10000,
          gist: "Discussion of next steps",
          headline: "Action Items Discussion",
          summary: "Team members assigned tasks and set deadlines for upcoming milestones."
        }
      ];
      
      await prisma.issue.createMany({
        data: mockSummaries.map((summary) => ({
          start: summary.start.toString(),
          end: summary.end.toString(),
          gist: summary.gist,
          headline: summary.headline,
          summary: summary.summary,
          meetingId
        }))
      });
      
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { 
          status: "COMPLETED",
          name: mockSummaries[0]!.headline || "Meeting Summary", 
        }
      });
      
      return NextResponse.json({ success: true, message: "Mock processing completed" });
    }
    // For production URLs, use actual Assembly AI processing
    const { summaries } = await processMeeting(meetingUrl);
    if (!summaries || !Array.isArray(summaries) || summaries.length === 0) {
      return NextResponse.json({ error: "No summaries returned from Assembly AI" }, { status: 400 });
    }
    await prisma.issue.createMany({
      data: summaries.map((summary) => ({
        start: summary.start.toString(),
        end: summary.end.toString(),
        gist: summary.gist,
        headline: summary.headline,
        summary: summary.summary,
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
    return NextResponse.json({ success: true });
  } catch (error) {
     console.error(error);
     return NextResponse.json({ error: "Failed to process meeting" }, { status: 500 });
  }
}