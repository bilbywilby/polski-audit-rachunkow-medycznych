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
      <SidebarInset className="relative flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <SidebarTrigger />
          <div className="flex flex-1 items-center justify-end gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 cursor-default select-none">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase hidden sm:inline">{t('privacy.active')}</span>
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
        <footer className="border-t bg-muted/30 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center justify-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" /> HIPAA-Friendly Privacy Model
              </p>
              <p className="text-xs text-muted-foreground italic max-w-2xl mx-auto leading-relaxed">
                {t('footer.privacy')}
              </p>
            </div>
            <div className="flex justify-center flex-wrap items-center gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
              <span className="bg-muted px-2 py-1 rounded border">PA Act 102 Compliant</span>
              <span>•</span>
              <span className="bg-muted px-2 py-1 rounded border">No Surprises Act Ready</span>
              <span>•</span>
              <span className="bg-muted px-2 py-1 rounded border">100% Local-First Audit</span>
            </div>
            <p className="text-[10px] text-muted-foreground/40 max-w-md mx-auto">
              Disclaimer: BillGuard PA is a diagnostic tool and does not constitute legal or financial advice.
            </p>
          </div>
        </footer>
        <Toaster richColors closeButton />
      </SidebarInset>
    </SidebarProvider>
  );
}