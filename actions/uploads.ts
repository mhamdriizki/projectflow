"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireProjectMember } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/ratelimit";
import { cloudinary } from "@/lib/cloudinary";
import { logger } from "@/lib/logger";
import { avatarFileSchema, attachmentFileSchema, type UploadActionState } from "@/types/upload";

export async function updateAvatar(
  _prev: UploadActionState,
  formData: FormData
): Promise<UploadActionState> {
  const session = await requireSession();

  const { limited } = await checkRateLimit(`updateAvatar:${session.user.id}`);
  if (limited) return { error: "Too many requests, please wait." };

  const parsed = avatarFileSchema.safeParse(formData.get("file"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const bytes = await parsed.data.arrayBuffer();
    const b64 = Buffer.from(bytes).toString("base64");
    const result = await cloudinary.uploader.upload(
      `data:${parsed.data.type};base64,${b64}`,
      {
        folder: "projectflow/avatars",
        public_id: `user-${session.user.id}`,
        overwrite: true,
      }
    );

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.secure_url },
    });

    revalidatePath("/profile");
    return { url: result.secure_url };
  } catch (err) {
    logger.error("avatar upload failed", { userId: session.user.id, error: String(err) });
    return { error: "Upload failed, please try again." };
  }
}

export async function createAttachment(
  taskId: string,
  _prev: UploadActionState,
  formData: FormData
): Promise<UploadActionState> {
  const session = await requireSession();

  const { limited } = await checkRateLimit(`createAttachment:${session.user.id}`);
  if (limited) return { error: "Too many requests, please wait." };

  const parsed = attachmentFileSchema.safeParse(formData.get("file"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "Task not found" };

  await requireProjectMember(task.projectId);

  try {
    const bytes = await parsed.data.arrayBuffer();
    const b64 = Buffer.from(bytes).toString("base64");
    const result = await cloudinary.uploader.upload(
      `data:${parsed.data.type};base64,${b64}`,
      { folder: `projectflow/tasks/${taskId}` }
    );

    await prisma.attachment.create({
      data: { taskId, url: result.secure_url, filename: parsed.data.name },
    });

    revalidatePath(`/tasks/${taskId}`);
    return { url: result.secure_url };
  } catch (err) {
    logger.error("attachment upload failed", { taskId, error: String(err) });
    return { error: "Upload failed, please try again." };
  }
}
