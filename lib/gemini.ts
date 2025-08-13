"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const summariseModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

/**
 * Summarises a Git diff using Gemini
 */
export async function aiSummariseCommit(diff: string): Promise<string> {
  try {
    const prompt = `You are an expert programmer and you are trying to summarise a git diff:\n\n${diff}`;
    const response = await summariseModel.generateContent([prompt]);
    return response.response.text();
  } catch (err) {
    console.error("Error in aiSummariseCommit:", err);
    throw err;
  }
}

/**
 * Summarises the purpose of a given code file (for onboarding juniors)
 */
export async function summariseCode(doc: Document): Promise<string> {
  console.log("Summarising:", doc.metadata.source);

  try {
    const code = doc.pageContent.slice(0, 10_000);
    const prompt = `You are an intelligent senior software engineer onboarding a junior engineer.
Explain the purpose of the file ${doc.metadata.source} in no more than 100 words.

---
${code}
---`;

    const response = await summariseModel.generateContent([prompt]);
    return response.response.text();
  } catch (err) {
    console.error("Error in summariseCode:", err);
    return "";
  }
}

/**
 * Generates a text embedding from a summary
 */
export async function generateEmbedding(summary: string): Promise<number[]> {
  console.log("Gemini API Key exists:", !!process.env.GEMINI_API_KEY);

  try {
    const result = await embeddingModel.embedContent(summary);
    return result.embedding.values;
  } catch (err) {
    console.error("Error in generateEmbedding:", err);
    throw err;
  }
}

// --- Optional: Manual Test Runner ---
// This only runs when you explicitly run this file with ts-node or node.
// It will NOT run when the file is imported elsewhere.
if (require.main === module) {
  (async () => {
    console.log("Running manual Gemini test...");
    const testDiff = "diff --git a/test.js b/test.js\n--- a/test.js\n+++ b/test.js\n+console.log('Hello World');";
    const summary = await aiSummariseCommit(testDiff);
    console.log("Summary:", summary);
  })();
}
