"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

type Meeting = {
  id: string;
  name: string;
  meetingUrl: string;
  createdAt: string;
  status: "PROCESSING" | "COMPLETED";
  issues: Issue[];
};

const fetchMeetingById = async (meetingId: string): Promise<Meeting> => {
  const { data } = await axios.get(`/api/meetings/${meetingId}`);
  return data;
};

export default function useMeetingById(meetingId?: string) {
  return useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => fetchMeetingById(meetingId!),
    enabled: !!meetingId,
    staleTime: 1000 * 60 * 5,
  });
}
