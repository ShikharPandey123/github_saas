import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type CheckCreditsRequest = {
  githubUrl: string;
  githubToken?: string;
};

type CheckCreditsResponse = {
  fileCount: number;
  userCredits: number;
  hasEnoughCredits: boolean;
};

export default function useCheckCredits() {
  return useMutation<CheckCreditsResponse, Error, CheckCreditsRequest>({
    mutationFn: async ({ githubUrl, githubToken }) => {
      const response = await axios.post("/api/check-credits", {
        githubUrl,
        githubToken,
      });
      return response.data;
    },
  });
}
