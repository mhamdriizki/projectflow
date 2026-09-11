import { requiredProjectMember } from "@/lib/permissions";
import { ProjectActionState } from "@/types/project";

export async function updateProject(
  projectId: string,
  _prev: ProjectActionState,
  formData: FormData,
) {
  await requiredProjectMember(projectId)
}