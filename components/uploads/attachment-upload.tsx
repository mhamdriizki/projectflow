"use client";

import { useActionState, useRef } from "react";
import { createAttachment } from "@/actions/uploads";
import { Button } from "../ui/button";

export function AttachmentUpload({ taskId }: { taskId: string }) {
  const [state, action, pending] = useActionState(
    createAttachment.bind(null, taskId),
    {}
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        name="file"
        className="hidden"
        onChange={() => formRef.current?.requestSubmit()}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? "Uploading…" : "Attach file"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
