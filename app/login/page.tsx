"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Martini } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/lib/auth/hooks";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    if (!loading && user?.role) {
      const targetPath = redirectTo || (
        user.role === 'admin' ? '/admin' :
        user.role === 'venue' ? '/venue' :
        '/dashboard'
      );
      router.push(targetPath);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="flex items-center mb-8">
            <Martini className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold">Gold Class Girls</span>
          </Link>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-2">
            Sign in to access your account
          </p>
        </div>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}