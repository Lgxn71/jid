import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { Button } from "~/components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function FailedLoginAlert() {
	return (
		<Alert variant="destructive">
			<ExclamationTriangleIcon className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				Your session has expired. Please log in again.
			</AlertDescription>
		</Alert>
	);
}

export default function Login() {
	const [searchParams] = useSearchParams();

	return (
		<>
			<Form className="grid gap-4" method="POST" action="/auth/github">
				{searchParams.get("failed") === "true" && <FailedLoginAlert />}
				<Button type="submit" variant="outline" className="w-full">
					Login with GitHub
				</Button>
			</Form>
		</>
	);
}

export async function loader({ request }: LoaderFunctionArgs) {
	// If the user is already authenticated redirect to /dashboard directly
	return await authenticator.isAuthenticated(request, {
		successRedirect: "/dashboard",
		failureRedirect: "/login?failed=true",
	});
}
