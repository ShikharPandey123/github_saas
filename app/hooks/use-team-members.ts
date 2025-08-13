import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type User = {
  id: string;
  emailAddress: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

type TeamMember = {
  id: string;
  userId: string;
  projectId: string;
  user: User;
};

type UseTeamMembersProps = {
  projectId: string | null;
};

export default function useTeamMembers({ projectId }: UseTeamMembersProps) {
  return useQuery<TeamMember[], Error>({
    queryKey: ["teamMembers", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("No project ID");
      const response = await axios.get(`/api/getTeamMembers?projectId=${projectId}`);
      return response.data;
    },
    enabled: !!projectId, // Only run query if projectId exists
  });
}