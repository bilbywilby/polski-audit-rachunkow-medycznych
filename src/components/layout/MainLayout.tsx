import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { ShieldCheck, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export function MainLayout(): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative flex flex-col min-h-screen bg-background transition-colors duration-300">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <SidebarTrigger />
          <div className="flex flex-1 items-center justify-end gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 cursor-default select-none">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Privacy Mode Active</span>
                    <Lock className="h-3 w-3 sm:hidden" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Processing is occurring locally in your browser. No bill data is uploaded to our servers.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ThemeToggle className="static" />
          </div>
        </header>
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
            <Outlet />
          </div>
        </main>
        <footer className="border-t bg-muted/30 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground italic max-w-2xl mx-auto">
              Disclaimer: BillGuard PA is not a legal advisor or insurance agent. Audit results are based on heuristic pattern matching and Pennsylvania cost benchmarks (averaged for 2024-2025).
            </p>
            <div className="flex justify-center items-center gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">
              <span>Privacy Verified</span>
              <span>•</span>
              <span>PA Resident Tool</span>
              <span>•</span>
              <span>Local-First Design</span>
            </div>
          </div>
        </footer>
        <Toaster richColors closeButton />
      </SidebarInset>
    </SidebarProvider>
  );
}