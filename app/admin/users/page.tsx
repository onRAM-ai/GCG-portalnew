import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsersContent } from "@/components/admin/users/users-content";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", session.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <UsersContent />
      </Suspense>
    </div>
  );
}