"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ParticlesBackground } from "@/components/particles-background";
import { useAuth } from "@/lib/auth/hooks";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="relative min-h-screen">
          <ParticlesBackground />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}