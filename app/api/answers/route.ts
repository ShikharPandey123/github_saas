import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const saveAnswerSchema = z.object({
  projectId: z.string(),
  question: z.string(),
  answer: z.string(),
  fileReferences: z.any().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json(
      { error: "You must be logged in" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const input = saveAnswerSchema.parse(body);

    const answer = await prisma.question.create({
      data: {
        answer: input.answer,
        filesReferences: input.fileReferences,
        projectId: input.projectId,
        question: input.question,
        userId,
      },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
