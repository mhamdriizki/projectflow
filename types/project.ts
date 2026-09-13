import z from "zod";

export type ProjectActionState = {
  error?: string;
};

export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  color: z.string().max(100, "Color is too long").optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const AddMemberSchema = z.object({
  email: z.email("Enter a valid email"),
});
