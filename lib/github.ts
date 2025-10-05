/* eslint-disable @typescript-eslint/no-explicit-any */
import { Octokit } from "@octokit/rest";
import { prisma } from "./prisma";
import { aiSummariseCommit } from "./gemini";

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

function parseGithubOwnerRepo(url: string) {
  // handle ssh form: git@github.com:owner/repo.git
  if (url.startsWith("git@")) {
    const m = url.match(/git@[^:]+:([^/]+)\/(.+?)(?:\.git)?(?:\/.*)?$/);
    if (m) return { owner: m[1], repo: m[2] };
  }

  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1].replace(/\.git$/i, "");
      return { owner, repo };
    }
  } catch {
    // fallback to simple split
    const parts = url.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const owner = parts.slice(-2)[0];
      const repo = parts.slice(-2)[1].replace(/\.git$/i, "");
      return { owner, repo };
    }
  }
  throw new Error("Invalid GitHub URL");
}
export const getCommitHashes = async (
  githubUrl: string
): Promise<Response[]> => {
  const { owner, repo } = parseGithubOwnerRepo(githubUrl);
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
  const { githubUrl } = await fetchProjectGithubUrl(projectId);
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
  // fetch the diff via authenticated GitHub API to avoid web endpoint inconsistencies
  try {
    const { owner, repo } = parseGithubOwnerRepo(githubUrl);
    const res = await github.request('GET /repos/{owner}/{repo}/commits/{ref}', {
      owner,
      repo,
      ref: commitHash,
      headers: {
        accept: 'application/vnd.github.v3.diff',
      },
    });
    const data = (res.data as unknown) as string;
    console.log(`summariseCommit: fetched diff (api) for ${commitHash}, length=${String(data).length}`);
    if (!data || String(data).trim().length === 0) {
      console.warn(`summariseCommit: empty diff for ${commitHash}`);
      return "";
    }
    const summary = await aiSummariseCommit(data);
    console.log(`summariseCommit: summary for ${commitHash} length=${summary ? summary.length : 0}`);
    return summary || "";
  } catch (err) {
    console.error(`summariseCommit: failed for ${commitHash}:`, err);
    return "";
  }
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
    githubUrl: project.githubUrl,
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
