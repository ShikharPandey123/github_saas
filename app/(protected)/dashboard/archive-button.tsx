"use client";

import useProject from "@/app/hooks/use-project";
import useArchiveProject from "@/app/hooks/use-archive-project";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import useRefetch from "@/app/hooks/use-refetch";
import { Trash2 } from "lucide-react";

const ArchiveButton = () => {
  const { projectId, project, setProjectId } = useProject();
  const refetch = useRefetch();
  const { mutate: archiveProject, isPending } = useArchiveProject();

  const handleArchive = () => {
    if (!projectId) return;

    archiveProject(
      { projectId },
      {
        onSuccess: () => {
          toast.success("Project archived successfully");
          // Clear the selected project if it was the one archived
          if (project?.id === projectId) {
            setProjectId(null);
          }
          refetch();
        },
        onError: () => {
          toast.error("Failed to archive project");
        },
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          disabled={isPending} 
          size="sm" 
          variant="destructive"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {isPending ? "Archiving..." : "Archive"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive &quot;{project?.name}&quot;? This action cannot be undone. 
            The project will be moved to your archived projects and will no longer be accessible 
            from your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
          >
            {isPending ? "Archiving..." : "Archive Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ArchiveButton;