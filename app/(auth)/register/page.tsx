import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">Start managing your projects</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
