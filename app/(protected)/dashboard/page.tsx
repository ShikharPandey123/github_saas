"use client";
import useProject from "@/app/hooks/use-project";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";

const DashboardPage = () => {
  const { project } = useProject();
  return (
    <div className="p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* github link */}
        <div className="w-full sm:w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-sm font-medium text-white break-all">
                This project is linked to {""}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline break-all"
                >
                  <span className="truncate">{project?.githubUrl}</span>
                  <ExternalLink className="ml-1 size-4 flex-shrink-0" />
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>
      <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <AskQuestionCard />
            <MeetingCard />
          </div>
      </div>
      <div className="mt-8"></div>
      <CommitLog />
    </div>
  );
};

export default DashboardPage;
