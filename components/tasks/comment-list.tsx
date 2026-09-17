import { deleteComment } from "@/actions/comments";

type Comment = {
  id: string;
  body: string;
  authorId: string;
  author: { name: string };
};

export function CommentList({
  comments,
  currentUserId,
}: {
  comments: Comment[];
  currentUserId: string;
}) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet</p>;
  }

  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li key={c.id} className="rounded-md border p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{c.author.name}</span>

            {c.authorId === currentUserId && (
              <form action={deleteComment.bind(null, c.id)}>
                <button
                  type="submit"
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Delete
                </button>
              </form>
            )}
          </div>

          <p className="mt-1 text-muted-foreground">{c.body}</p>
        </li>
      ))}
    </ul>
  );
}
