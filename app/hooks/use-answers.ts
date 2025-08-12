"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type FileReference = {
  fileName: string;
  sourceCode: string;
  summary: string;
};

type AnswerPayload = {
  projectId: string;
  question: string;
  answer: string;
  fileReferences?: FileReference[];
};

const postAnswer = async (payload: AnswerPayload) => {
  const { data } = await axios.post("/api/answers", payload);
  return data;
};

export default function useAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers"] });
    },
    onError: (error) => {
      console.error("Error saving answer:", error);
    },
  });
}
