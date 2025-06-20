
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Megaphone, Users, CreditCard, UserCircle, ChevronDown, ChevronRight, ClipboardList } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import React, { useState, useEffect } from 'react';

type ClientAdminSubNavItem = {
  href: string;
  label: string;
  icon?: React.ElementType;
};

type ClientAdminNavItem = {
  href?: string;
  label: string;
  icon: React.ElementType;
  basePath?: string;
  subItems?: ClientAdminSubNavItem[];
};

const clientAdminNavItems: ClientAdminNavItem[] = [
  { href: '/client-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, basePath: '/client-admin/dashboard' },
  {
    label: 'My Campaigns',
    icon: Megaphone,
    basePath: '/client-admin/campaigns',
    subItems: [
      { href: '/client-admin/campaigns', label: 'Manage Campaigns', icon: Megaphone },
      { href: '/client-admin/campaigns/call-history', label: 'Call History', icon: ClipboardList },
    ]
  },
  { href: '/client-admin/users', label: 'Manage Users', icon: Users, basePath: '/client-admin/users' },
  { href: '/client-admin/billing', label: 'Billing & Invoices', icon: CreditCard, basePath: '/client-admin/billing' },
  { href: '/client-admin/profile', label: 'My Profile', icon: UserCircle, basePath: '/client-admin/profile' },
];

export function ClientAdminSideNavigation() {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Automatically open the submenu if the current path matches a subitem's parent
    const activeParent = clientAdminNavItems.find(item => item.subItems && item.basePath && pathname.startsWith(item.basePath));
    if (activeParent) {
      setOpenSubmenus(prev => ({ ...prev, [activeParent.label]: true }));
    }
  }, [pathname]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Logo iconClassName="text-sidebar-primary" textClassName="text-sidebar-foreground" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {clientAdminNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild={!item.subItems}
                onClick={item.subItems ? () => toggleSubmenu(item.label) : undefined}
                isActive={item.subItems ? (item.basePath ? pathname.startsWith(item.basePath) : false) : (item.href ? (pathname === item.href || (item.basePath && pathname.startsWith(item.basePath))) : false)}
                tooltip={{ children: item.label, className: "bg-popover text-popover-foreground border-border" }}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
              >
                {item.subItems ? (
                  <>
                    <item.icon />
                    <span>{item.label}</span>
                    {openSubmenus[item.label] ? <ChevronDown className="ml-auto h-4 w-4 shrink-0" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0" />}
                  </>
                ) : (
                  <Link href={item.href || '#'}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                )}
              </SidebarMenuButton>
              {item.subItems && openSubmenus[item.label] && (
                <SidebarMenuSub>
                  {item.subItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.href}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === subItem.href}
                        className="text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary/80 data-[active=true]:text-sidebar-primary-foreground"
                      >
                        <Link href={subItem.href} className="flex items-center">
                          {subItem.icon && <subItem.icon className="h-3.5 w-3.5 mr-2 shrink-0" />}
                          <span>{subItem.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
