import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Greetings */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold"> Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-foreground underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
