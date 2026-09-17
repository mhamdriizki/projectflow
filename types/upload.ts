import z from "zod";

export type UploadActionState = {
  error?: string;
  url?: string
}

export const avatarFileSchema = z
  .instanceof(File)
  .refine((f) => f.size > 0, 'File is empty')
  .refine((f) => f.size <= 5*1024*1024, 'Maximum 5 MB')
  .refine((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type), "File must be JPEG/PNG/WEBP only");