import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

type CreateMeetingInput = {
  projectId: string;
  file: File;
  name?: string;
};

type Meeting = {
  id: string;
  meetingUrl: string;
  name: string;
  projectId: string;
  status: string;
  createdAt: string;
};

export default function useCreateMeeting() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<Meeting, Error, CreateMeetingInput>({
    mutationFn: async ({ projectId, file, name }: CreateMeetingInput) => {
      // 1️⃣ Upload via server-side endpoint
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded * 100) / event.total));
        },
      });

      const { secure_url, public_id } = uploadRes.data.data;

      // 2️⃣ Create meeting in DB
      const response = await axios.post("/api/uploadMeeting", {
        projectId,
        meetingUrl: secure_url,
        name: name || file.name,
        publicId: public_id,
      });

      setProgress(0);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", variables.projectId] });
    },
  });

  return { ...mutation, progress };
}
