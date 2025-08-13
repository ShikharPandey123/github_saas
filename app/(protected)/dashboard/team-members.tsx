"use client";
import useProject from "@/app/hooks/use-project";
import useTeamMembers from "@/app/hooks/use-team-members";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = useTeamMembers({ projectId });
  
  return (
    <div className="flex items-center gap-2">
      {members?.map((member) => (
        <img 
          key={member.id} 
          src={member.user.imageUrl || ''} 
          height={30}
          width={30}
          alt={member.user.firstName || 'Team member'} 
          className="rounded-full"
        />
      ))}
    </div>
  );
};

export default TeamMembers;