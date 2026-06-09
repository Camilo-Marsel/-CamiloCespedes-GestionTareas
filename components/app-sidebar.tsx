'use client';

import * as React from 'react';
import { NavUser } from '@/components/nav-user';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ChartHistogramIcon,
  Folder01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { SessionUser } from '@/lib/auth';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionUser;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Transacciones',
      url: '/transactions',
      icon: <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} />,
      roles: ['ADMIN', 'USER'],
    },
    {
      title: 'Proyectos',
      url: '/projects',
      icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
      roles: ['ADMIN', 'USER'],
    },
    {
      title: 'Usuarios',
      url: '/users',
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
      roles: ['ADMIN'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <Link href='/transactions'>
                <Image src='/LogoGreen.png' alt='Logo' width={72} height={72} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className='px-2 py-4 gap-1'>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className='gap-3 px-3 py-2'
              >
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email, avatar: user.image || '' }} />
      </SidebarFooter>
    </Sidebar>
  );
}
