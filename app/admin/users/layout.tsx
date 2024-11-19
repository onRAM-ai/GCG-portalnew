import { ParticlesBackground } from "@/components/particles-background";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <ParticlesBackground />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}