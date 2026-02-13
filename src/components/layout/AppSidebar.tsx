import React from "react";
import {
  Shield,
  FileText,
  BookOpen,
  Landmark,
  History,
  LayoutDashboard,
  Search,
  Languages,
  TrendingUp
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const menuItems = [
    { title: t('nav.dashboard'), icon: LayoutDashboard, url: "/" },
    { title: t('nav.audit'), icon: Search, url: "/audit" },
    { title: t('nav.insurancerates'), icon: TrendingUp, url: "/insurance-audit" },
    { title: t('nav.history'), icon: History, url: "/history" },
  ];
  const knowledgeItems = [
    { title: t('nav.glossary'), icon: BookOpen, url: "/glossary" },
    { title: t('nav.resources'), icon: Landmark, url: "/resources" },
    { title: t('nav.letters'), icon: FileText, url: "/letters" },
  ];
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight truncate">BillGuard PA</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{language === 'pl' ? 'Nawigacja' : 'Navigation'}</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{language === 'pl' ? 'Wiedza i Narzędzia' : 'Knowledge & Tools'}</SidebarGroupLabel>
          <SidebarMenu>
            {knowledgeItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 space-y-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 h-9 text-xs"
            onClick={toggleLanguage}
          >
            <Languages className="h-4 w-4" />
            {language === 'pl' ? 'English (US)' : 'Przeł��cz na Polski'}
          </Button>
          <div className="rounded-lg bg-muted p-3 text-[10px] text-muted-foreground border border-border">
            <p className="font-bold text-foreground mb-1 uppercase tracking-wider">Local-First / HIPAA</p>
            {language === 'pl' ? 'Dane nie opuszczają przeglądarki.' : 'Your data stays on this device.'}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}