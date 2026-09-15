import { z } from "zod";

export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const CreateTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  status: TaskStatusEnum.default("TODO"),
  priority: PriorityEnum.default("MEDIUM"),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

// Task gak boleh pindah project lewat update (projectId di-omit) — semua
// field lain dari Create jadi optional (.partial()), user cuma perlu
// ngirim field yang beneran mau diubah.
export const UpdateTaskSchema = CreateTaskSchema.omit({ projectId: true }).partial();

export type TaskActionState = {
  error?: string;
};

export const CreateCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
  taskId: z.string().min(1),
});
