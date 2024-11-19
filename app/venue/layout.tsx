import { RoleGuard } from "@/components/auth/role-guard";

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["venue"]}>
      <div className="min-h-screen">
        {children}
      </div>
    </RoleGuard>
  );
}