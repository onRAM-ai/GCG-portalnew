import { RoleGuard } from "@/components/auth/role-guard";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <div className="min-h-screen">
        {children}
      </div>
    </RoleGuard>
  );
}