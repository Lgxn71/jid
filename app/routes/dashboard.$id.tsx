import type { Organization, Project } from '@prisma/client';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, redirect, useLoaderData } from '@remix-run/react';
import { parse, stringify } from 'superjson';
import { authenticator, isLoggedIn } from '~/auth.server';
import { AppSidebar } from '~/components/app-sidebar';
import { SidebarLayout, SidebarTrigger } from '~/components/ui/sidebar';
import { OrgContext } from '~/context/orgContext';
import { ProjContext } from '~/context/projContext';
import { prisma } from '~/db.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);

  if (user) {
    const currentOrg = await prisma.organization.findFirst({
      where: {
        id: params.id
      }
    });

    if (!currentOrg) {
      return redirect('/dashboard');
    }

    const orgs = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            id: user.id
          }
        }
      }
    });

    const proj = await prisma.project.findMany({
      where: {
        organizationId: currentOrg.id,
        members: {
          some: {
            id: user.id
          }
        }
      }
    });

    return stringify({
      orgs,
      proj
    });
  }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const formData = await request.formData();
  const user = await authenticator.isAuthenticated(request);

  const formDataObj = Object.fromEntries(formData);

  if (formDataObj.intent === 'CREATE_PROJECT' && formDataObj.name && user) {
    const newOrg = await prisma.project.create({
      data: {
        organization: {
          connect: {
            id: params.id
          }
        },
        members: {
          connect: {
            id: user.id
          }
        },
        name: formDataObj.name.toString()
      }
    });

    console.log(newOrg);

    return redirect(`/dashboard/${params.id}/chat/${newOrg.id}`);
  }
};

export default function Page() {
  const data = parse<{
    orgs: Organization[];
    proj: Project[];
  }>(useLoaderData<typeof loader>());

  return (
    <OrgContext.Provider value={data.orgs}>
      <ProjContext.Provider value={data.proj}>
        <SidebarLayout defaultOpen={true}>
          <AppSidebar />
          <main className="flex h-full w-full flex-col p-4 transition-all duration-300 ease-in-out">
            <div className="flex flex-col h-full rounded-md border-2 border-dashed relative">
              <div className="size-12 flex items-center w-full border-b p-2">
                <SidebarTrigger />
              </div>
              <div className="pb-[7.1rem] h-[calc(100%_-_4rem)] w-full p-2">
                <Outlet />
              </div>
            </div>
          </main>
        </SidebarLayout>
      </ProjContext.Provider>
    </OrgContext.Provider>
  );
}
