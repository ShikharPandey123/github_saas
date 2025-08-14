"use client";
import useMeetingById from "@/app/hooks/use-meeting-by-id";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoIcon } from "lucide-react";
import { useState, useEffect } from "react";

type Issue = {
  id: string;
  start: string;
  end: string;
  gist: string;
  headline: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

export default function IssuesList({ meetingId }: { meetingId: string }) {
  const { data: meeting, isLoading } = useMeetingById(meetingId);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!meeting) return <div>No meeting found</div>;

  return (
    <>
      <div className="p-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b lg:mx-0 lg:max-w-none lg:border-0">
          <div className="rounded-full border bg-white p-6">
            <VideoIcon className="h-8 w-8" />
          </div>
          <h1>
            <div className="text-sm leading-6 text-gray-500">
              Meeting on {isMounted ? new Date(meeting.createdAt).toLocaleDateString() : meeting.createdAt}
            </div>
            <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
              {meeting.name}
            </div>
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {meeting.issues && meeting.issues.length > 0 ? (
            meeting.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No issues found for this meeting
            </div>
          )}
        </div>
      </div>
    </>
  );
}
function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{issue.gist}</DialogTitle>
            <DialogDescription>{issue.createdAt}</DialogDescription>
          </DialogHeader>
          <p className="text-gray-900">{issue.headline}</p>
          <blockquote className="mt-2 border-l-4 border-gray-300 bg-gray-50 p-4">
            <span className="text-sm text-gray-600">
              {issue.start} - {issue.end}
            </span>
          </blockquote>
          <p className="font-medium italic leading-relaxed text-gray-900">
            {issue.summary}
          </p>
        </DialogContent>
      </Dialog>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">{issue.gist}</CardTitle>
          <div className="border-b"></div>
          <CardDescription>{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)}>Details</Button>
        </CardContent>
      </Card>
    </>
  );
}
