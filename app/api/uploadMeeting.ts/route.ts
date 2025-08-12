import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { projectId, meetingUrl, name } = req.body;

    if (!projectId || !meetingUrl || !name) {
      return res.status(400).json({ message: "Missing required fields" });
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

    return res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
