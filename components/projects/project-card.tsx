import Link from "next/link";
import { Badge } from "../ui/badge";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    archived: boolean;
    _count: { members: number; tasks: number };
  };
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-2">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: project.color ?? "#94a3b8" }}
        />
        <h3 className="font-medium">{project.name}</h3>
        {project.archived && <Badge variant="secondary">Archived</Badge>}
      </div>

      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {project._count.members} members - {project._count.tasks} tasks
      </p>
    </Link>
  );
}
