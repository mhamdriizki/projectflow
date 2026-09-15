import { z } from "zod";

export const avatarFileSchema = z
  .instanceof(File)
  .refine((f) => f.size > 0, "File is empty")
  .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5MB")
  .refine(
    (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    "JPEG/PNG/WebP only"
  );

export const attachmentFileSchema = z
  .instanceof(File)
  .refine((f) => f.size > 0, "File is empty")
  .refine((f) => f.size <= 10 * 1024 * 1024, "Max 10MB");

export type UploadActionState = {
  error?: string;
  url?: string;
};
