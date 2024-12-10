import { Link, useParams } from '@remix-run/react';
import { Bell, Frame, LifeBuoy, Send } from 'lucide-react';
import { useContext, useMemo } from 'react';

import { NavProjects } from '~/components/nav-projects';
import { NavSecondary } from '~/components/nav-secondary';
import { NavUser } from '~/components/nav-user';
import { TeamSwitcher } from '~/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroup
} from '~/components/ui/sidebar';
import { useMessageContext } from '~/context/messagesContext';
import { UserContext } from '~/context/userContext';
import { Badge } from './ui/badge';

const data = {
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send
    }
  ]
};

export function AppSidebar() {
  const user = useContext(UserContext);
  const params = useParams();
  const { messages } = useMessageContext();

  const notificationCount = useMemo(
    () =>
      messages.reduce(
        (prev, curr) =>
          prev + (curr.readByUserIds?.includes(user?.id!) ? 0 : 1),
        0
      ),
    [messages]
  );

  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Personal</SidebarGroupLabel>
          <Link
            to={`/dashboard/${params.id}/notifications`}
            className="flex h-7 items-center overflow-hidden rounded-md px-1.5 text-xs outline-none ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
          >
            <Bell className="h-4 w-4 shrink-0 translate-x-0.5 text-muted-foreground mr-2.5" />
            <div className="line-clamp-1 grow overflow-hidden pr-6 font-medium">
              Notifications
            </div>
            {notificationCount > 0 && (
              <Badge
                variant="default"
                className="h-4 min-w-4 rounded-full px-1 text-[10px] font-semibold"
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Link>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <NavProjects />
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Help</SidebarGroupLabel>
          <NavSecondary items={data.navSecondary} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
