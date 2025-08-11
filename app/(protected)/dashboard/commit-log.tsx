"use client";

import React from "react";
import Image from "next/image";
import useProject from "@/app/hooks/use-project";
import useCommits from "@/app/hooks/use-commits";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// type Commit = {
//   id: string;
//   commitMessage: string;
//   commitHash: string;
//   commitAuthorName: string;
//   commitAuthorAvatar: string;
//   commitDate: string;
//   summary: string;
// };
export default function CommitLog() {
  const { data: commits, isLoading, isError, error } = useCommits();
  console.log("Fetched commits:", commits);
  const { project } = useProject();
  console.log("Selected project:", project);
  if (!commits && !isLoading) {
    return <div>Please select a project to view commits.</div>;
  }

  if (isLoading) {
    return <div>Loading commits...</div>;
  }

  if (isError) {
    return <div>Error loading commits: {(error as Error).message}</div>;
  }

  return (
    <>
      <h2>Commit Log</h2>
      <ul>
        {commits?.map((commit, commitIdx) => {
          return (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                  "absolute left-0 top-0 flex w-6 justify-center"
                )}
              >
                <div className="w-px translate-x-1 bg-gray-200"></div>
              </div>
              <>
                <img
                  src={commit.commitAuthorAvatar}
                  alt="commit avatar"
                  // width={56}
                  // height={56}
                  className="relative mt-4  size-8 flex-none rounded-full bg-gray-50"
                />
                <div className="flex-auto rounded-mg bg-white p-3 ring-1 ring-inset ring-gray-200">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                      className="py-0.5 text-xs leading-6 text-gray-600"
                    >
                      <span className="font-medium text-gray-900">
                        {commit.commitAuthorName}
                      </span>{" "}
                      <span className="inline-flex items-center">
                        committed
                        <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="font-semibold">{commit.commitMessage}</span>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                    {commit.summary}
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
}
