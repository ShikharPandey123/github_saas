import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type CreateMeetingInput = {
  projectId: string;
  meetingUrl: string;
  name: string;
};

export default function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateMeetingInput, unknown>({
    mutationFn: async (data: CreateMeetingInput) => {
      await axios.post("/api/uploadMeeting", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", variables.projectId] });
    },
  });
}