export async function uploadAudioToCloudinary(file: File) {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', 'meetings');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error('Upload failed');

  return (await res.json()) as {
    url: string;
    publicId: string;
    bytes?: number;
    duration?: number;
    format?: string;
  };
}
