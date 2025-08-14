"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function useDeleteMeeting(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const deleteMeeting = async (meetingId: string) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/meetings/${meetingId}`);
      
      if (response.data) {
        toast.success("Meeting deleted successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Delete meeting error:", error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to delete meeting";
        const errorDetails = error.response?.data?.details;
        
        console.error("Error details:", errorDetails);
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return { deleteMeeting, loading };
}
