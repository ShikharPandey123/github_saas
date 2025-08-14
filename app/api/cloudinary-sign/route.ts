import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse CLOUDINARY_URL safely
  const cloudinaryUrl = process.env.CLOUDINARY_URL!;
  // Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  const [, rawApiKey, rest] = cloudinaryUrl.split(":");
  const [apiSecret, cloudName] = rest.split("@");

  // Remove leading // from API key
  const apiKey = rawApiKey.replace(/^\/\//, "");

  const timestamp = Math.floor(Date.now() / 1000);

  // Generate signature for folder based on userId
  const signature = cloudinary.utils.api_sign_request(
    { folder: `meetings/${userId}`, timestamp },
    apiSecret
  );

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder: `meetings/${userId}`,
  });
}
