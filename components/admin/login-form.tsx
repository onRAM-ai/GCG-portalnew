"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/components/ui/toaster";
import { Shield } from "lucide-react";
import Link from "next/link";
import { adminLogin } from "@/lib/auth/admin-auth";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, error, user } = await adminLogin(email, password);

      if (!success || error) {
        throw new Error(error || 'Login failed');
      }

      if (user) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        router.push("/admin");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log in",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <Shield className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-muted-foreground mt-2">
          Please sign in to access the admin panel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Development Credentials:
            </p>
            <p className="text-sm font-mono mt-1">
              Email: admin@example.com<br />
              Password: Admin123!@#
            </p>
          </div>
        )}
      </form>
    </Card>
  );
}