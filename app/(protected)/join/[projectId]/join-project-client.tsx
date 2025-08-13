"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useProject from "@/app/hooks/use-project";
import { toast } from "sonner";

interface JoinProjectClientProps {
  projectId: string;
  projectName: string;
}

export default function JoinProjectClient({ projectId, projectName }: JoinProjectClientProps) {
  const router = useRouter();
  const { setProjectId, refetchProjects } = useProject();

  useEffect(() => {
    const handleJoin = async () => {
      try {
        // Set the joined project as active
        setProjectId(projectId);
        
        // Refetch projects to include the newly joined project
        await refetchProjects();
        
        // Show success message
        toast.success(`Successfully joined "${projectName}"!`);
        
        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Error joining project:", error);
        toast.error("Failed to join project");
        router.push("/dashboard");
      }
    };

    handleJoin();
  }, [projectId, projectName, setProjectId, refetchProjects, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h1 className="text-xl font-semibold">Joining Project...</h1>
        <p className="text-muted-foreground">You&apos;re being added to &quot;{projectName}&quot;</p>
      </div>
    </div>
  );
}
