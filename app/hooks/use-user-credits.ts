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
    staleTime: 30 * 1000, // 30 seconds (shorter for testing)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}
