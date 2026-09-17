"use client";

import { updateAvatar } from "@/actions/uploads";
import { useActionState, useRef, useState } from "react";
import { Button } from "../ui/button";

export function AvatarUpload({
  initialUrl,
  name,
}: {
  initialUrl: string | null;
  name: string;
}) {
  const [state, action, pending] = useActionState(updateAvatar, {});
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const src = state.url ?? preview;

  return (
    <form ref={formRef} action={action} className="flex items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPreview(URL.createObjectURL(file));
          formRef.current?.requestSubmit();
        }}
      />

      {src ? (
        <img
          src={src}
          alt={name}
          className="size-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-16 items-center rounded-full bg-muted-foreground text-lg font-medium">
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? "Uploading..." : "Change photo"}
        </Button>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>
    </form>
  );
}
