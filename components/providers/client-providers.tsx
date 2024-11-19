"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import Navbar from '@/components/navbar';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <div className="relative z-0 min-h-screen">
          <Navbar />
          <main className="relative z-10 main-content">
            {children}
          </main>
          <Toaster />
          <SonnerToaster 
            position="top-right"
            closeButton
            richColors
            expand
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}