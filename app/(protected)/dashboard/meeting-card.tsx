"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { Presentation, Upload } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import useProject from "@/app/hooks/use-project";
import { uploadFile } from "@/lib/firebase";
import useMeetings from "@/app/hooks/use-meetings";
import useCreateMeeting from "@/app/hooks/use-create-meeting";
import { toast } from "sonner";

type Meeting = {
  id: string;
  name: string;
  meetingUrl: string;
  createdAt: string;
};

const MeetingCard: React.FC = () => {
  const { projectId } = useProject();
  const { data: meetings = [], isLoading: loadingMeetings, error: loadError } = useMeetings();
  const { mutate: createMeeting, isPending: isUploading, error: uploadError } = useCreateMeeting();
  const [progress, setProgress] = React.useState(0);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (!projectId || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setProgress(0);
      
      try {
        console.log("Starting upload for:", file.name);
        // Upload file to Firebase
        const downloadURL = await uploadFile(file, setProgress) as string;
        console.log("File uploaded, URL:", downloadURL);
        
        // Call mutation to create meeting
        createMeeting(
          {
            projectId,
            meetingUrl: downloadURL,
            name: file.name,
          },
          {
            onSuccess: () => {
              console.log("Meeting created successfully");
              toast.success("Meeting uploaded successfully!");
              setProgress(0);
            },
            onError: (error) => {
              console.error("Create meeting error:", error);
              toast.error("Failed to create meeting");
            },
          }
        );
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload file");
      }
    },
    [projectId, createMeeting]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".m4a", ".wav", ".aac"],
    },
    multiple: false,
    maxSize: 60_000_000, // 60MB
    onDrop,
  });

  const error = loadError ? "Failed to load meetings" : uploadError ? "Upload failed" : null;

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-6">
      {isUploading ? (
        <div className="flex flex-col items-center gap-4">
          <div style={{ width: 96, height: 96 }}>
            <CircularProgressbar
              value={progress}
              maxValue={100}
              text={`${Math.round(progress)}%`}
              styles={buildStyles({
                pathColor: "#6366F1",
                textColor: "#111827",
                trailColor: "#E5E7EB",
              })}
            />
          </div>
          <p className="text-sm text-gray-500">Uploading your meeting...</p>
        </div>
      ) : (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Create a new meeting</h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyze your meeting with Commitly!
            <br />
            Powered by AI.
          </p>

          <div className="mt-6" {...getRootProps()}>
            <Button disabled={isUploading}>
              <Upload className="ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Meetings list */}
      <div className="mt-6 w-full">
        {loadingMeetings ? (
          <div className="text-center text-gray-500 text-sm">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">No meetings yet</div>
        ) : (
          <ul className="space-y-2">
            {meetings.map((meeting: Meeting) => (
              <li key={meeting.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{meeting.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(meeting.createdAt).toLocaleString()}
                  </span>
                </div>
                <a
                  className="text-sm text-indigo-600 hover:underline"
                  href={meeting.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default MeetingCard;