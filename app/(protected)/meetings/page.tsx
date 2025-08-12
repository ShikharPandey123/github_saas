"use client";

import React from "react";
import MeetingCard from "../dashboard/meeting-card";
// import useProject from "@/app/hooks/use-project";
import useMeetings from "@/app/hooks/use-meetings";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MeetingsPage() {
  //   const { projectId } = useProject();
  const { data: meetings, isLoading } = useMeetings();

  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>

      {isLoading && <div>Loading...</div>}
      {meetings && meetings.length === 0 && <div>No meetings found</div>}

      <ul className="divide-y divide-grey-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between py-5 gap-x-6"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>
                </div>
                {meeting.status === "PROCESSING" && (
                  <Badge className="bg-yellow-500 text-white">
                    Processing...
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-500 gap-x-2">
              <p className="whitespace-nowrap">{meeting.createdAt}</p>
              <p className="truncate">{meeting.issues.length} issues</p>
            </div>
            <div className="flex items-center flex-none gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button variant="outline">View Meeting</Button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
