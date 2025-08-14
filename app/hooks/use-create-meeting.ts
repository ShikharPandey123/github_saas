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
      // 1️⃣ Get signed Cloudinary payload from server
      const signRes = await fetch("/api/cloudinary-sign");
      if (!signRes.ok) throw new Error("Failed to get Cloudinary signature");
      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

      // 2️⃣ Prepare FormData for direct signed upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      // 3️⃣ Upload directly to Cloudinary
      const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      });

      const { secure_url, public_id } = cloudRes.data;

      // 4️⃣ Create meeting record in DB
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
