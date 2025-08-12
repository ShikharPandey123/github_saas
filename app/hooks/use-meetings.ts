"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useProject from "@/app/hooks/use-project";

type Meeting = {
  issues: Issue[];
  id: string;
  name: string;
  meetingUrl: string;
  createdAt: string;
  status: "PROCESSING" | "COMPLETED";
};

type Issue = {
  id: string;
  start: string;
  end: string;
  gist: string;
  headline: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

const fetchMeetings = async (projectId: string): Promise<Meeting[]> => {
  const { data } = await axios.get("/api/getMeetings", {
    params: { projectId },
  });
  return data;
};

export default function useMeetings() {
  const { projectId } = useProject();

  return useQuery({
    queryKey: ["meetings", projectId],
    queryFn: () => fetchMeetings(projectId!),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
}
