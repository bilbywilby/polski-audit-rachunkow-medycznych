import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
export function MainLayout(): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative flex flex-col min-h-screen bg-background transition-colors duration-300">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <SidebarTrigger />
          <div className="flex flex-1 items-center justify-end">
            <ThemeToggle className="static" />
          </div>
        </header>
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
            <Outlet />
          </div>
        </main>
        <footer className="border-t bg-muted/30 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-muted-foreground italic">
              Disclaimer: BillGuard PA is not a legal advisor or insurance agent. Audit results are based on heuristics.
            </p>
          </div>
        </footer>
        <Toaster richColors closeButton />
      </SidebarInset>
    </SidebarProvider>
  );
}