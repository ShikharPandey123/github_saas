/* eslint-disable @typescript-eslint/no-explicit-any */
import { Octokit } from "octokit";
import { prisma } from "./prisma";
import { aiSummariseCommit } from "./gemini";
import axios from "axios";

export const github = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// const githubUrl = "https://github.com/ShikharPandey123/Intern_assignment";

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};
export const getCommitHashes = async (
  githubUrl: string
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  const { data } = await github.rest.repos.listCommits({
    owner,
    repo,
  });
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime()
  ) as any[];
  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitMessage: commit.commit.message ?? "",
    commitHash: commit.sha as string,
    commitAuthorName: commit.commit.author.name ?? "",
    commitAuthorAvatar: commit.author.avatar_url ?? "",
    commitDate: commit.commit.author.date ?? "",
  }));
};
export const pullCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    commitHashes,
    projectId
  );
  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map(commit => {
      return summariseCommit(githubUrl, commit.commitHash);
    }));
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value;
    } else {
      console.error("Error summarising commit:", response.reason);
      return null;
    }
  })
  const commits= await prisma.commit.createMany({
    data: summaries.map((summary, index) =>{
      console.log(`processing commit ${index}`)
      return{
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary:summary ?? ""
      }
    }),
  });
  console.log("commits after creation:", commits)
  return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
  //get the diff,then pass the diff into ai
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  return aiSummariseCommit(data) || "";
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });
  if (!project?.githubUrl) {
    throw new Error("Project not found or GitHub URL is missing");
  }
  return {
    project,
    githubUrl: project?.githubUrl,
  };
}
async function filterUnprocessedCommits(
  commitHashes: Response[],
  projectId: string
) {
  const processedCommits = await prisma.commit.findMany({
    where: { projectId },
    select: { commitHash: true },
  });
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processed) => processed.commitHash === commit.commitHash
      )
  );
  return unprocessedCommits;
}
await pullCommits("a544b103-8092-422f-bb0c-4b1f270b962e").then(console.log);
