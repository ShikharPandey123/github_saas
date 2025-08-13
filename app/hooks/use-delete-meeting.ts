"use client";
import { useState } from "react";
import axios from "axios";

export default function useDeleteMeeting(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const deleteMeeting = async (meetingId: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/meetings/${meetingId}`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { deleteMeeting, loading };
}
