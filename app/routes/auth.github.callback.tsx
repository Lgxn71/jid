import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
	console.log("lo");
	return await authenticator.authenticate("github", request, {
		successRedirect: "/dashboard",
		failureRedirect: "/",
		throwOnError: true,
	});
}
