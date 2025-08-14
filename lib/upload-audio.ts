import axios from "axios";

export async function uploadAudioToCloudinary(file: File) {
  // 1️⃣ Get signed payload from server
  const signRes = await fetch("/api/cloudinary-sign");
  if (!signRes.ok) throw new Error("Failed to get Cloudinary signature");
  const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

  // 2️⃣ Prepare FormData for direct upload
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
        const progress = Math.round((event.loaded * 100) / event.total);
        console.log(`Upload progress: ${progress}%`);
      }
    },
  });

  const { secure_url, public_id, bytes, duration, format } = cloudRes.data;

  return {
    url: secure_url,
    publicId: public_id,
    bytes,
    duration,
    format,
  };
}
