import { RoleGuard } from "@/components/auth/role-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["user"]}>
      <div className="min-h-screen">
        {children}
      </div>
    </RoleGuard>
  );
}