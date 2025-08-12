import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const questions = await prisma.question.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questions);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
