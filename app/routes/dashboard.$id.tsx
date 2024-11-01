import type { Organization, Project } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
	await isLoggedIn(request);
	const formData = await request.formData();
	console.log(formData);

	console.log("called");
	const user = await authenticator.isAuthenticated(request);

	const formDataObj = Object.fromEntries(formData);

	console.log(formDataObj);

	if (formDataObj.intent === "CREATE_PROJECT" && formDataObj.name && user) {
		const newOrg = await prisma.project.create({
			data: {
				organization: {
					connect: {
						id: params.id,
					},
				},
				members: {
					connect: {
						id: user.id,
					},
				},
				name: formDataObj.name.toString(),
			},
		});

		console.log(newOrg);

		return redirect(`/dashboard/${newOrg.id}`);
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
