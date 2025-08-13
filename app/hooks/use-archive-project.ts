import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

type ArchiveProjectInput = {
  projectId: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  userId: string;
  isArchived: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, ArchiveProjectInput, unknown>({
    mutationFn: async (data: ArchiveProjectInput) => {
      const response = await axios.post("/api/archiveProject", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Project archived successfully!");
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Archive project error:", error);
      toast.error("Failed to archive project");
    },
  });
}