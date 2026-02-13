import React from "react";
import { 
  Shield, 
  FileText, 
  BookOpen, 
  Landmark, 
  History, 
  LayoutDashboard,
  Search
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
import { cn } from "@/lib/utils";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/" },
    { title: "Audit Studio", icon: Search, url: "/audit" },
    { title: "History", icon: History, url: "/history" },
  ];
  const knowledgeItems = [
    { title: "Glossary", icon: BookOpen, url: "/glossary" },
    { title: "PA Resources", icon: Landmark, url: "/resources" },
    { title: "Letter Generator", icon: FileText, url: "/letters" },
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
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
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
          <SidebarGroupLabel>Knowledge & Tools</SidebarGroupLabel>
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
        <div className="p-4">
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground border border-border">
            <p className="font-medium text-foreground mb-1">Privacy Focused</p>
            Audit data is processed locally in your browser.
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}