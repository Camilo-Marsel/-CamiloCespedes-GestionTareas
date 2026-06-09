'use client';

import * as React from 'react';
import { NavUser } from '@/components/nav-user';
import { NotificationBell } from '@/components/notification-bell';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ChartHistogramIcon, Folder01Icon, UserGroupIcon,
  CheckmarkSquare02Icon, TaskDone01Icon, ListViewIcon,
  BubbleChatIcon,
} from '@hugeicons/core-free-icons';
import { SessionUser } from '@/lib/auth';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionUser;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { title: 'Tareas', url: '/tasks', icon: TaskDone01Icon, roles: ['ADMIN'] },
    { title: 'Mis Tareas', url: '/my-tasks', icon: ListViewIcon, roles: ['USER'] },
    { title: 'Historial', url: '/historial', icon: ChartHistogramIcon, roles: ['ADMIN', 'USER'] },
    { title: 'Proyectos', url: '/projects', icon: Folder01Icon, roles: ['ADMIN', 'USER'] },
    { title: 'Chat', url: '/chat', icon: BubbleChatIcon, roles: ['ADMIN', 'USER'] },
    { title: 'Usuarios', url: '/users', icon: UserGroupIcon, roles: ['ADMIN'] },
  ];

  const visibleItems = navItems.filter(item => (item.roles as string[]).includes(user.role));

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader className='border-b border-border/60 px-4 py-4'>
        <div className='flex items-center gap-2'>
          <Link href={user.role === 'ADMIN' ? '/tasks' : '/my-tasks'} className='flex items-center gap-3 flex-1 min-w-0'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm'>
              <HugeiconsIcon icon={CheckmarkSquare02Icon} strokeWidth={2} className='size-5 text-primary-foreground' />
            </div>
            <div className='flex flex-col leading-tight min-w-0'>
              <span className='text-sm font-bold tracking-tight text-foreground'>TaskFlow</span>
              <span className='text-[11px] text-muted-foreground'>Gestión de proyectos</span>
            </div>
          </Link>
          <NotificationBell />
        </div>
      </SidebarHeader>

      <SidebarContent className='px-3 py-4'>
        <p className='mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>Navegación</p>
        <SidebarMenu className='gap-0.5'>
          {visibleItems.map(item => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild isActive={isActive}
                  className={`gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Link href={item.url}>
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} className={`size-[18px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    {item.title}
                    {isActive && <span className='ml-auto h-1.5 w-1.5 rounded-full bg-primary' />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className='border-t border-border/60 p-3'>
        <NavUser user={{ name: user.name, email: user.email, avatar: user.image || '' }} />
      </SidebarFooter>
    </Sidebar>
  );
}
