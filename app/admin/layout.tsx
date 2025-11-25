
'use client';
import { Home, Users, BarChart2, Settings, LifeBuoy } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="w-full min-h-screen flex">
        <Sidebar collapsible="icon" side="left" variant="sidebar" className="glass-card !bg-transparent !border-0">
          <SidebarContent className="p-2">
            <SidebarHeader>
              <div className="flex items-center justify-between p-2">
                <span className="text-2xl font-bold text-main-accent">Admin</span>
                <SidebarTrigger />
              </div>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/admin" passHref>
                  <SidebarMenuButton tooltip="Dashboard" isActive={isActive('/admin')}>
                    <Home />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/admin/users" passHref>
                  <SidebarMenuButton tooltip="Users" isActive={isActive('/admin/users')}>
                    <Users />
                    <span>Users</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/admin/analytics" passHref>
                  <SidebarMenuButton tooltip="Analytics" isActive={isActive('/admin/analytics')}>
                    <BarChart2 />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/admin/settings" passHref>
                  <SidebarMenuButton tooltip="Settings" isActive={isActive('/admin/settings')}>
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Support">
                  <LifeBuoy />
                  <span>Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="p-4 md:p-8 !m-0 !bg-transparent w-full">
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
