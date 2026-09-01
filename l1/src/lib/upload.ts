import { supabase, uuid } from "./supabase";

// Uploads a captured photo to Supabase Storage and returns a public URL.
// Falls back to the raw data URL if storage is unavailable (e.g. bucket
// not created), so the lot flow always works.
export async function uploadPhoto(dataUrl: string): Promise<string> {
  if (!supabase) return dataUrl;

  const byteString = atob(dataUrl.split(",")[1]);
  const mime = dataUrl.split(",")[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const array = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) array[i] = byteString.charCodeAt(i);
  const file = new File([array], `${uuid()}.jpg`, { type: mime });

  const { error } = await supabase.storage.from("lot-photos").upload(file.name, file, {
    contentType: mime,
  });
  if (error) return dataUrl;

  const { data } = supabase.storage.from("lot-photos").getPublicUrl(file.name);
  return data.publicUrl;
}
