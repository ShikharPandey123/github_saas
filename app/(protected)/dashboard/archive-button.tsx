"use client";

import useProject from "@/app/hooks/use-project";
import useArchiveProject from "@/app/hooks/use-archive-project";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/app/hooks/use-refetch";

const ArchiveButton = () => {
  const { projectId } = useProject();
  const refetch = useRefetch();
  const { mutate: archiveProject, isPending } = useArchiveProject();

  const handleArchive = () => {
    if (!projectId) return;

    const confirmed = window.confirm("Are you sure you want to archive this project?");
    if (confirmed) {
      archiveProject(
        { projectId },
        {
          onSuccess: () => {
            toast.success("Project archived");
            refetch();
          },
          onError: () => {
            toast.error("Failed to archive project");
          },
        }
      );
    }
  };

  return (
    <Button 
      disabled={isPending} 
      onClick={handleArchive} 
      size="sm" 
      variant="destructive"
    >
      {isPending ? "Archiving..." : "Archive"}
    </Button>
  );
};

export default ArchiveButton;