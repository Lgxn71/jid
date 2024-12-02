import type { LoaderFunctionArgs } from '@remix-run/node';
import {
  json,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useParams
} from '@remix-run/react';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from '@tanstack/react-query';
import { parse, stringify } from 'superjson';
import { authenticator, isLoggedIn } from '~/auth.server';
import { AppSidebar } from '~/components/app-sidebar';
import { CommandMenu } from '~/components/cmd-k';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { prisma } from '~/db.server';
import { loader as orgLoader } from '~/routes/api.organization.$id';

export const loader = async ({
  request,
  params,
  context
}: LoaderFunctionArgs) => {
  const [orgs, projects] = await orgLoader({
    request,
    params,
    context
  })
    .then(data => data.json())
    .then(data => [parse(data.orgs), parse(data.projects)]);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['orgs'],
    queryFn: () => orgs
  });

  await queryClient.prefetchQuery({
    queryKey: ['projects'],
    queryFn: () => projects
  });

  return json({
    dehydratedState: dehydrate(queryClient)
  });
};

export default function Page() {
  const params = useParams();
  const location = useLocation();
  console.log(location);
  const { dehydratedState } = useLoaderData<typeof loader>();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="flex h-svh w-full flex-col p-4 transition-all duration-300 ease-in-out">
        <div className="flex flex-col h-full rounded-md border-2 border-dashed relative w-full">
          <div className="size-12 flex items-center w-full border-b p-2 justify-between">
            <SidebarTrigger />
            <Tabs
              defaultValue={
                location.pathname.includes('canvas')
                  ? 'canvas'
                  : location.pathname.includes('tasks')
                  ? 'tasks'
                  : 'chat'
              }
            >
              <TabsList>
                <TabsTrigger value="chat" asChild>
                  <NavLink
                    to={`/dashboard/${params.id}/p/${params.chatId}`}
                    end
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? 'bg-background text-foreground'
                          : 'text-muted-foreground'
                      } px-4 py-2`
                    }
                  >
                    Chat
                  </NavLink>
                </TabsTrigger>
                <TabsTrigger value="tasks" asChild>
                  <NavLink
                    to={`/dashboard/${params.id}/p/${params.chatId}/tasks`}
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? 'bg-background text-foreground'
                          : 'text-muted-foreground'
                      } px-4 py-2`
                    }
                  >
                    Tasks
                  </NavLink>
                </TabsTrigger>
                <TabsTrigger value="canvas" asChild>
                  <NavLink
                    to={`/dashboard/${params.id}/p/${params.chatId}/canvas`}
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? 'bg-background text-foreground'
                          : 'text-muted-foreground'
                      } px-4 py-2`
                    }
                  >
                    Canvas
                  </NavLink>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="h-[calc(100svh_-_5.5rem)] w-full p-2">
            <Outlet />
          </div>
        </div>
      </main>
      <CommandMenu />
    </SidebarProvider>
  );
}
