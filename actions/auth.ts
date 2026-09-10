"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";

const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthState = {
  error?: string;
};

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { limited } = await checkRateLimit(`signIn:${parsed.data.email}`);
  if (limited) return { error: "Too many requests. Please wait." };

  const result = await auth.api.signInEmail({
    body: parsed.data,
    headers: await headers(),
    asResponse: false,
  });
  if (!result || "code" in result) {
    return { error: "Invalid email or password" };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await auth.api.signUpEmail({
    body: parsed.data,
    headers: await headers(),
    asResponse: false,
  });
  if (!result || "code" in result) {
    return { error: "Could not create account. Email may already be in use." };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
