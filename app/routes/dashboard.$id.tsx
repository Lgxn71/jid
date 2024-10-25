import type { Organization, Project } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { parse, stringify } from "superjson";
import { authenticator, isLoggedIn } from "~/auth.server";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarLayout, SidebarTrigger } from "~/components/ui/sidebar";
import { OrgContext } from "~/context/orgContext";
import { ProjContext } from "~/context/projContext";
import { prisma } from "~/db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	await isLoggedIn(request);
	const user = await authenticator.isAuthenticated(request);

	if (user) {
		const currentOrg = await prisma.organization.findFirst({
			where: {
				id: params.id,
			},
		});

		if (!currentOrg) {
			return redirect("/dashboard");
		}

		const orgs = await prisma.organization.findMany({
			where: {
				members: {
					some: {
						id: user.id,
					},
				},
			},
		});

		const proj = await prisma.project.findMany({
			where: {
				organizationId: currentOrg.id,
				members: {
					some: {
						id: user.id,
					},
				},
			},
		});

		return stringify({
			orgs,
			proj,
		});
	}
};

export default function Page() {
	const data = parse<{
		orgs: Organization[];
		proj: Project[];
	}>(useLoaderData<typeof loader>());

	console.log(data);

	return (
		<OrgContext.Provider value={data.orgs}>
			<ProjContext.Provider value={data.proj}>
				<SidebarLayout defaultOpen={true}>
					<AppSidebar />
					<main className="flex flex-1 flex-col p-2 transition-all duration-300 ease-in-out">
						<div className="h-full rounded-md border-2 border-dashed p-2">
							<SidebarTrigger />
							<Outlet />
						</div>
					</main>
				</SidebarLayout>
			</ProjContext.Provider>
		</OrgContext.Provider>
	);
}
