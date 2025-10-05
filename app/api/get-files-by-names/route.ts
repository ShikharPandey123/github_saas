import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/get-files-by-names?projectId=...&files=a.ts,b.tsx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const filesParam = searchParams.get("files");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }
  if (!filesParam) {
    return NextResponse.json({ files: [] });
  }

  try {
    const raw = filesParam.split(",").map((s) => s.trim()).filter(Boolean);
    const unique = Array.from(new Set(raw)).slice(0, 20); // safety cap

    const files = await prisma.sourceCodeEmbedding.findMany({
      where: {
        projectId,
        fileName: { in: unique },
      },
      select: {
        fileName: true,
        sourceCode: true,
        summary: true,
      },
    });

    return NextResponse.json({ files });
  } catch (err) {
    console.error("get-files-by-names error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
