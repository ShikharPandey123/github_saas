"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useProject from "@/app/hooks/use-project";

type Commit = {
  id: string;
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
  summary: string;
};

const fetchCommits = async (projectId: string): Promise<Commit[]> => {
  const { data } = await axios.get("/api/commit", {
    params: { projectId },
  });
  return data;
};

export default function useCommits() {
  const { project } = useProject();
  console.log("Selected project:", project);

  return useQuery({
    queryKey: ["commits", project?.id],
    queryFn: () => fetchCommits(project!.id),
    enabled: !!project?.id, // only run when projectId is available
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}
