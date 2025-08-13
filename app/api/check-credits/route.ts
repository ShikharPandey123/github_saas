import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkCredits } from "@/lib/github-credits";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "User must be authenticated" },
        { status: 401 }
      );
    }

    const { githubUrl, githubToken } = await request.json();
    console.log("Check credits request:", { githubUrl, hasToken: !!githubToken, userId });

    if (!githubUrl) {
      return NextResponse.json(
        { error: "GitHub URL is required" },
        { status: 400 }
      );
    }

    // Get user's current credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("User found, credits:", user.credits);

    // Check file count for the repository
    console.log("Calling checkCredits function...");
    const fileCount = await checkCredits(githubUrl, githubToken);
    console.log("File count result:", fileCount);
    
    const userCredits = user.credits;

    return NextResponse.json({
      fileCount,
      userCredits,
      hasEnoughCredits: userCredits >= fileCount
    });

  } catch (error) {
    console.error("Error checking credits:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { error: "Failed to check credits", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
