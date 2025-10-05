'use server'

import { streamText } from 'ai'
import { createStreamableValue} from '@ai-sdk/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding, askProjectQuestion } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue()

  const queryVector = await generateEmbedding(question)
  const vectorQuery = `[${queryVector.join(',')}]`
  const result = await prisma.$queryRaw`
  SELECT "fileName", "sourceCode", "summary",
   1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
` as { fileName: string; sourceCode: string; summary: string; similarity?: number }[];

  // fetch project metadata and recent commit summaries to include as additional context
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true, githubUrl: true },
  })

  const recentCommits = await prisma.commit.findMany({
    where: { projectId },
    orderBy: { commitDate: 'desc' },
    take: 8,
    select: { commitHash: true, commitMessage: true, summary: true },
  })

  let context = `Project: ${project?.name ?? 'unknown'}\nRepo: ${project?.githubUrl ?? 'unknown'}\n\nRecent commits:\n`
  for (const c of recentCommits) {
    context += `- ${c.commitHash}: ${c.commitMessage}\n  Summary: ${c.summary ?? 'no summary'}\n`
  }
  context += '\nFiles in scope:\n'
  for (const doc of result) {
    // Truncate large code snippets to avoid hitting token limits in the model
    const codeSnippet = doc.sourceCode?.slice(0, 3_000) ?? ''
    context += `source: ${doc.fileName}\nSummary: ${doc.summary}\nCode:\n${codeSnippet}\n\n`
  }
  // First try to get a structured answer (JSON) from the Gemini wrapper
  const structured = await askProjectQuestion(context, question);

  // Decide which files to attach to this answer: prefer the exact files the model cited; fallback to vector-selected files
  let filesToReturn: { fileName: string; sourceCode: string; summary: string }[] = result.map(r => ({ fileName: r.fileName, sourceCode: r.sourceCode, summary: r.summary }));
  if (structured?.files && structured.files.length) {
    const fileNames = Array.from(new Set(structured.files.map((f) => f.trim()).filter(Boolean))).slice(0, 20);
    if (fileNames.length) {
      const citedFiles = await prisma.sourceCodeEmbedding.findMany({
        where: { projectId, fileName: { in: fileNames } },
        select: { fileName: true, sourceCode: true, summary: true },
      });
      if (citedFiles.length) {
        filesToReturn = citedFiles as { fileName: string; sourceCode: string; summary: string }[];
      }
    }
  }

  if (structured) {
    // Format a short markdown response using the structured data and stream that to the client
    const files = structured.files && structured.files.length ? structured.files : []
    const commits = structured.commits && structured.commits.length ? structured.commits : []
    const fallback = structured.sources && structured.sources.length ? structured.sources : []

    const sourcesMdParts: string[] = []
    if (files.length) sourcesMdParts.push(`Files: ${files.join(', ')}`)
    if (commits.length) sourcesMdParts.push(`Commits: ${commits.join(', ')}`)
    if (!files.length && !commits.length && fallback.length) sourcesMdParts.push(fallback.join(', '))

    const md = `**Answer**\n\n${structured.answer}\n\n**Explanation**\n\n${structured.explanation}\n\n**SOURCES**\n\n${sourcesMdParts.join('\n')}`;
    stream.update(md);
    stream.done();
  } else {
    // Fallback: stream a longer, more conversational response from the model
    (async () => {
      const { textStream } = await streamText({
        model: google('models/gemini-2.5-flash'),
        prompt: `You are an expert code assistant. When answering the question, you MUST only use information present in the provided CONTEXT BLOCK. If the answer cannot be determined from the context, reply exactly: "I don't know — the provided project context is insufficient." Do NOT invent facts or guess.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

At the end, include a SOURCES section listing both file paths (from lines starting with "source:") and commit hashes that directly support your answer. Use only items present in the CONTEXT.
` });
      for await ( const delta of textStream ) {
        stream.update(delta);
      }
      stream.done();
    })();
  }
  return {
    output:stream.value,
    filesReferences:filesToReturn
  }
}