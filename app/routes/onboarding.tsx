import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticator, isLoggedIn } from "~/auth.server";
import type { User } from "@prisma/client";
import { parse, stringify } from "superjson";
import { redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { ArrowRight, CheckCircle2, UserCircle2, Zap } from "lucide-react";
import { prisma } from "~/db.server";
import { z } from "zod";
import { commitSession, getSession } from "~/sessions.server";

const onboardingSchema = z
	.object({
		firstName: z.string().max(30).min(1),
		lastName: z.string().max(30).min(1),
		profession: z.string(),
	})
	.required();

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await isLoggedIn(request);
	const user = await authenticator.isAuthenticated(request);
	if (user?.isOnboarded) {
		return redirect("/dashboard");
	}
	return stringify(user);
};

export const action = async ({ request }: ActionFunctionArgs) => {
	await isLoggedIn(request);
	const { id: userId } = (await authenticator.isAuthenticated(request))!;
	const formData = await request.formData();

	const formDataObj = Object.fromEntries(formData) as z.infer<
		typeof onboardingSchema
	>;

	const data = onboardingSchema.parse(formDataObj);

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			...data,
			isOnboarded: true,
		},
	});

	const session = await getSession(request.headers.get("Cookie"));

	session.set("user", updatedUser);

	const headers = new Headers({ "Set-Cookie": await commitSession(session) });

	return redirect("/onboarding", { headers });
};

export default function UserOnboarding() {
	const [step, setStep] = useState(0);
	const fetcher = useFetcher();
	const data = parse<User>(useLoaderData<typeof loader>());
	const [firstName, setFirstName] = useState(data.firstName);
	const [lastName, setLastName] = useState(data.lastName ?? "");
	const [profession, setProfession] = useState(data.profession ?? "");
	const [error, setError] = useState("");

	const onSubmit = () => {
		console.log({ firstName, lastName, profession });
		const { data, error } = onboardingSchema.safeParse({
			firstName,
			lastName,
			profession,
		});

		if (error) {
			setError(error.message);
		}

		fetcher.submit(
			{
				...data,
			},
			{ method: "POST" },
		);
	};

	const steps = [
		{
			title: "Welcome",
			description: "Let's get you started with our app",
			content: (
				<div className="space-y-4 text-center">
					<UserCircle2 className="mx-auto h-12 w-12 text-primary" />
					<h3 className="text-lg font-medium">Welcome to Our App</h3>
					<p className="text-sm text-muted-foreground">
						We're excited to have you on board. Let's set up your account in
						just a few easy steps.
					</p>
				</div>
			),
		},
		{
			title: "Profile Setup",
			description: "Tell us a bit about yourself",
			content: (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">First Name</Label>
						<Input
							id="firstName"
							placeholder="Enter your first name"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="lastName">Your Name</Label>
						<Input
							id="lastName"
							placeholder="Enter your last name"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Your Role</Label>
						<RadioGroup value={profession} onValueChange={setProfession}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="developer" id="developer" />
								<Label htmlFor="developer">Developer</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="designer" id="designer" />
								<Label htmlFor="designer">Designer</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="other" id="other" />
								<Label htmlFor="other">Other</Label>
							</div>
						</RadioGroup>
					</div>
				</div>
			),
		},
		{
			title: "Feature Highlights",
			description: "Check out what you can do",
			content: (
				<div className="space-y-4">
					<Zap className="mx-auto h-12 w-12 text-primary" />
					<h3 className="text-lg font-medium text-center">Key Features</h3>
					<ul className="list-disc list-inside space-y-2 text-sm">
						<li>Collaborative workspaces</li>
						<li>Real-time updates</li>
						<li>Advanced AI features</li>
						<li>Intuitive UI</li>
					</ul>
				</div>
			),
		},
	];

	const handleNext = () => {
		if (step < steps.length - 1) {
			setStep(step + 1);
		} else {
			// Handle onboarding completion
			console.log("Onboarding completed!");
		}
	};

	const isLastStep = step === steps.length - 1;

	return (
		<Card className="w-[400px] mx-auto">
			<CardHeader>
				<CardTitle>{steps[step]?.title}</CardTitle>
				<CardDescription>{steps[step]?.description}</CardDescription>
			</CardHeader>
			<CardContent>
				{step < steps.length ? (
					steps[step]?.content
				) : (
					<div className="text-center space-y-4">
						<CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
						<h3 className="text-lg font-medium">All Set!</h3>
						<p className="text-sm text-muted-foreground">
							You're all set up and ready to go. Enjoy using our app!
						</p>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex justify-between">
				<div className="flex space-x-1">
					{steps.map((_, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={index}
							className={`h-2 w-2 rounded-full ${
								index <= step ? "bg-primary" : "bg-muted"
							}`}
						/>
					))}
				</div>
				<Button onClick={isLastStep ? onSubmit : handleNext}>
					{isLastStep ? "Get Started" : "Next"}
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}
