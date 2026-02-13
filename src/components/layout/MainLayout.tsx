import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { ShieldCheck, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/hooks/use-language";
export function MainLayout(): JSX.Element {
  const { t } = useLanguage();
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
                    <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{t('privacy.active')}</span>
                    <Lock className="h-3 w-3 sm:hidden" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{t('privacy.tooltip')}</p>
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
        <footer className="border-t bg-muted/30 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-foreground flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" /> Klauzula RODO & Prywatność
              </p>
              <p className="text-xs text-muted-foreground italic max-w-3xl mx-auto leading-relaxed">
                {t('footer.rodo')}
              </p>
            </div>
            <div className="flex justify-center items-center gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">
              <span>Zgodność z NFZ</span>
              <span>•</span>
              <span>Baza Wiedzy 2024/25</span>
              <span>•</span>
              <span>100% Offline Analysis</span>
            </div>
          </div>
        </footer>
        <Toaster richColors closeButton />
      </SidebarInset>
    </SidebarProvider>
  );
}