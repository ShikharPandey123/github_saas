import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type CreateMeetingInput = {
  projectId: string;
  meetingUrl: string;
  name: string;
};

type Meeting = {
  id: string;
  name: string;
  projectId: string;
  status: string;
  createdAt: string;
};

export default function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation<Meeting, Error, CreateMeetingInput, unknown>({
    mutationFn: async (data: CreateMeetingInput) => {
      const response = await axios.post("/api/uploadMeeting", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", variables.projectId] });
    },
  });
}