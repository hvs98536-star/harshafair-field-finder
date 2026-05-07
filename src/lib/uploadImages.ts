import { supabase } from "@/integrations/supabase/client";

export async function uploadImages(
  bucket: "profile-images" | "crop-images" | "request-images",
  userId: string,
  files: FileList | File[]
): Promise<string[]> {
  const list = Array.from(files);
  const urls: string[] = [];
  for (const file of list) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}