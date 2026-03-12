"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Eye, EyeOff, Building2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { register } from "@/actions/auth";
import { signIn } from "next-auth/react";
import type { UserRole } from "@prisma/client";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) ?? "INFLUENCER";

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await register({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role,
      });

      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-h3 text-gray-950">InfluencerConnect</span>
          </Link>
          <h1 className="text-h1 font-heading text-gray-950">Create your account</h1>
          <p className="text-body text-gray-500 mt-2">Join thousands of creators and brands</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("INFLUENCER")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-150",
                role === "INFLUENCER"
                  ? "border-brand-600 bg-brand-50 text-brand-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <Megaphone className="w-6 h-6" />
              <span className="text-body-sm font-medium">I&apos;m an Influencer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("COMPANY")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-150",
                role === "COMPANY"
                  ? "border-brand-600 bg-brand-50 text-brand-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-body-sm font-medium">I&apos;m a Company</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error-100 text-error-600 text-body-sm rounded-md px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Smith"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-caption text-gray-500">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              disabled={isPending}
            >
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              disabled={isPending}
            >
              GitHub
            </Button>
          </div>
        </div>

        <p className="text-center text-body-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
