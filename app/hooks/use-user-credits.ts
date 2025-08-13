import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type UserCreditsResponse = {
  credits: number;
};

export default function useUserCredits() {
  return useQuery<UserCreditsResponse, Error>({
    queryKey: ["userCredits"],
    queryFn: async () => {
      const response = await axios.get("/api/getUserCredits");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
