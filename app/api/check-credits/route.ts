import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
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

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true }
    });

    if (!user) {
      console.log("User not found in DB, creating...");

      // Fetch user details from Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const emailAddress = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const firstName = clerkUser.firstName ?? null;
      const lastName = clerkUser.lastName ?? null;
      const imageUrl = clerkUser.imageUrl ?? null;

      user = await prisma.user.create({
        data: {
          id: userId,
          emailAddress,
          firstName,
          lastName,
          imageUrl,
          credits: 150 // default credits
        },
        select: { id: true, credits: true }
      });
    }

    console.log("User found/created, credits:", user.credits);

    // Check file count for the repository
    console.log("Calling checkCredits function...");
    const fileCount = await checkCredits(githubUrl, githubToken);
    console.log("File count result:", fileCount);

    return NextResponse.json({
      fileCount,
      userCredits: user.credits,
      hasEnoughCredits: user.credits >= fileCount
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
