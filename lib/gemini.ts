"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const summariseModel = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash",
});

const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

/**
 * Summarises a Git diff using Gemini
 */
export async function aiSummariseCommit(diff: string): Promise<string> {
  try {
    // Ask the model for a short, actionable summary (3-5 bullets) and one-line headline
    const prompt = `You are an expert programmer. Produce a short, actionable summary for the following git diff. Start with a one-line headline, then 3 concise bullet points describing the impact, affected modules/files, and any likely migration or runtime risks. Use plain language and keep it under 200 words.\n\n${diff}`;
    console.log("aiSummariseCommit: prompt length", prompt.length);
    const response = await summariseModel.generateContent([prompt]);
    console.log("aiSummariseCommit: model response object:", response);
    // Try to read text in several possible shapes depending on client version
    try {
      if (response?.response?.text) {
        return response.response.text();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyResp: any = response;
      if (anyResp?.output?.[0]?.content?.[0]?.text) {
        return anyResp.output[0].content[0].text;
      }
      // Fallback: stringify and return
      const asString = JSON.stringify(response);
      console.warn("aiSummariseCommit: unexpected response shape, returning stringified response");
      return asString;
    } catch (innerErr) {
      console.error("aiSummariseCommit: failed to extract text from response", innerErr);
      throw innerErr;
    }
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
    try {
      if (response?.response?.text) return response.response.text();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyResp: any = response;
      if (anyResp?.output?.[0]?.content?.[0]?.text) return anyResp.output[0].content[0].text;
      return JSON.stringify(response);
    } catch (err) {
      console.error("summariseCode: failed to extract text", err);
      return "";
    }
  } catch (err) {
    console.error("Error in summariseCode:", err);
    return "";
  }
}

/**
 * Structured answer for project-level questions. The model is instructed to return JSON with keys:
 * { answer: string, explanation: string, sources: string[] }
 */
export async function askProjectQuestion(
  context: string,
  question: string
): Promise<{ answer: string; explanation: string; sources: string[]; files?: string[]; commits?: string[] } | null> {
  try {
    // Keep the prompt compact and force JSON output to make parsing deterministic
  const prompt = `You are an expert code assistant. Use ONLY the information in the provided CONTEXT to answer the question.\n\nCONTEXT:\n${context}\n\nQUESTION: ${question}\n\nReturn a JSON object with the following keys: \n- answer: a short direct answer (max 200 chars),\n- explanation: a brief explanation (max 300 words) that references context entries,\n- files: an array of file paths from the CONTEXT you used (use the exact \"source: <path>\" values),\n- commits: an array of commit SHAs from the CONTEXT you used,\n- sources: an array combining files and commits for backward compatibility.\n\nRules:\n- Do NOT invent files or commits; only include items present in the CONTEXT.\n- If the answer cannot be found, return {"answer":"I don't know","explanation":"","files":[],"commits":[],"sources":[]}.
`;

    console.log("askProjectQuestion: prompt length", prompt.length);
    const response = await summariseModel.generateContent([prompt]);
    console.log("askProjectQuestion: model response:", response);

    // Try to extract text and parse JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyResp: any = response;
    let text = "";
    if (response?.response?.text) text = response.response.text();
    else if (anyResp?.output?.[0]?.content?.[0]?.text) text = anyResp.output[0].content[0].text;
    else text = JSON.stringify(response);

    // Find the first JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/m);
    if (!jsonMatch) {
      console.warn("askProjectQuestion: no JSON found in model output, returning null");
      return null;
    }
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        answer: parsed.answer ?? parsed.summary ?? "",
        explanation: parsed.explanation ?? parsed.explain ?? "",
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        files: Array.isArray(parsed.files) ? parsed.files : undefined,
        commits: Array.isArray(parsed.commits) ? parsed.commits : undefined,
      };
    } catch (err) {
      console.error("askProjectQuestion: failed to parse JSON from model output", err);
      return null;
    }
  } catch (err) {
    console.error("Error in askProjectQuestion:", err);
    return null;
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
// Manual test runner. Guard against ESM environments where `require` is not defined.
// This block is intentionally inert during normal imports.
if (typeof require !== "undefined" && require.main === module) {
  (async () => {
    console.log("Running manual Gemini test...");
    const testDiff = "diff --git a/test.js b/test.js\n--- a/test.js\n+++ b/test.js\n+console.log('Hello World');";
    const summary = await aiSummariseCommit(testDiff);
    console.log("Summary:", summary);
  })();
}
