"use client";
import useProject from "@/app/hooks/use-project";
import useTeamMembers from "@/app/hooks/use-team-members";
import Image from "next/image";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = useTeamMembers({ projectId });
  
  return (
    <div className="flex items-center gap-2">
      {members?.map((member) => (
         <Image 
              key={member.id}
              src={member.user.imageUrl || '/placeholder-avatar.png'} 
              height={30}
              width={30}
              alt={member.user.firstName || 'Team member'} 
              className="rounded-full border border-gray-200"
            />
      ))}
    </div>
  );
};

export default TeamMembers;