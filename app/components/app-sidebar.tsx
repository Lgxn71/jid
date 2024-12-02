import { redirect } from '@remix-run/react';
import {
  Atom,
  Bird,
  BookOpen,
  Bot,
  Code2,
  Eclipse,
  Frame,
  History,
  LifeBuoy,
  Map as MapIcon,
  PieChart,
  Rabbit,
  Send,
  Settings2,
  SquareTerminal,
  Star,
  Turtle
} from 'lucide-react';
import { useContext } from 'react';

import { NavMain } from '~/components/nav-main';
import { NavProjects } from '~/components/nav-projects';
import { NavSecondary } from '~/components/nav-secondary';
import { NavUser } from '~/components/nav-user';
import { StorageCard } from '~/components/storage-card';
import { TeamSwitcher } from '~/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroup
} from '~/components/ui/sidebar';
import { UserContext } from '~/context/userContext';

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

  return (
    <Sidebar variant='floating'>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
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
