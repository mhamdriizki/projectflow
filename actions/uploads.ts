"use server";

import { cloudinary } from "@/lib/cloudinary";
import { logger } from "@/lib/logger";
import { requiredProjectMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { requireSession } from "@/lib/session";
import { avatarFileSchema, type UploadActionState } from "@/types/upload";

import { revalidatePath } from "next/cache";

export async function updateAvatar(
  _prev: UploadActionState,
  formData: FormData,
): Promise<UploadActionState> {
  // 1. Check session
  const session = await requireSession();

  // 2. Check rate limiter
  const { limited } = await checkRateLimit(`updateAvatar:${session.user.id}`);
  if (limited) return { error: "Too many request, please try again" };

  // 3. Parse form data
  const parsed = avatarFileSchema.safeParse(formData.get("file"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // try catch
  try {
    const bytes = await parsed.data.arrayBuffer();
    const b64 = Buffer.from(bytes).toString("base64");
    const result = await cloudinary.uploader.upload(
      `data:${parsed.data.type};base64,${b64}`,
      {
        folder: "projectflow/avatars",
        public_id: `user-${session.user.id}`,
        overwrite: true,
      },
    );

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.secure_url },
    });

    revalidatePath("/profile");
    return { url: result.secure_url };
  } catch (err) {
    logger.error("Avatar upload failed", {
      userId: session.user.id,
      error: String(err),
    });
    return { error: "Upload failed, please try again" };
  }
}

export async function createAttachment(
  taskId: string,
  _prev: UploadActionState,
  formData: FormData,
): Promise<UploadActionState> {
  const session = await requireSession();

  const { limited } = await checkRateLimit(`updateAvatar:${session.user.id}`);
  if (limited) return { error: "Too many request, please try again" };

  const parsed = avatarFileSchema.safeParse(formData.get("file"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  if (!task) return { error: "Task tidak ditemukan" };

  await requiredProjectMember(task.projectId);

  try {
    const bytes = await parsed.data.arrayBuffer();
    const b64 = Buffer.from(bytes).toString("base64");
    const result = await cloudinary.uploader.upload(
      `data:${parsed.data.type};base64,${b64}`,
      {
        folder: `projectflow/tasks/${taskId}`,
      },
    );

    await prisma.attachment.create({
      data: {
        taskId,
        url: result.secure_url,
        filename: parsed.data.name,
      },
    });

    revalidatePath(`/tasks/${taskId}`);
    return { url: result.secure_url };
  } catch (err) {
    logger.error("attachment upload failed", { taskId, error: String(err) });
    return { error: "Upload failed, please try again" };
  }
}
