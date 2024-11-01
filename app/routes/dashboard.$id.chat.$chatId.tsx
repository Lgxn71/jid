import React, { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useSocket } from "~/context/socketContext";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "~/components/ui/form";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TipTap from "~/components/ui/rich-text/tiptap";
import { useParams } from "@remix-run/react";
import { UserContext } from "~/context/userContext";
import { cn } from "~/lib/utils";

export default function ChatPage() {
	const socket = useSocket();
	const params = useParams();
	const user = useContext(UserContext);
	const [messages, setMessages] = useState<
		{
			userName: string;
			userId: string;
			message: string;
			createdAt: number;
		}[]
	>([]);

	useEffect(() => {
		if (!socket) return;

		socket.on("chat", (data: (typeof messages)[0]) => {
			console.log(data);
			setMessages((state) => [
				...state,
				{
					userName: data.userName,
					message: data.message,
					userId: data.userId,
					createdAt: data.createdAt,
				},
			]);
		});
	}, [socket]);

	const textSchema = z.object({
		description: z.string().min(1).max(500),
		createdAt: z.number().default(Date.now()),
	});

	const form = useForm<z.infer<typeof textSchema>>({
		resolver: zodResolver(textSchema),
		mode: "onChange",
		defaultValues: {
			description: "",
		},
	});

	function onSubmit(values: z.infer<typeof textSchema>) {
		socket?.emit("chat", {
			userName: user?.firstName,
			message: values.description,
			userId: user?.id!,
			createdAt: Date.now(),
		});

		setMessages((state) => [
			...state,
			{
				userName: user?.firstName!,
				message: values.description,
				userId: user?.id!,
				createdAt: Date.now(),
			},
		]);

		form.reset({
			description: "",
		});

		form.resetField("description");

		console.log(form.getValues("description"));
	}

	return (
		<main className="max-h-full h-full relative">
			<div className="bg-white h-full rounded-lg p-4 flex w-full flex-col gap-y-4">
				{messages.map((message) => (
					<div
						key={message.createdAt}
						className={cn("p-2 bg-gray-100 rounded w-[70%]", {
							"ml-auto": message.userId === user?.id,
						})}
					>
						<span>{message.userName}</span>
						<p
							// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
							dangerouslySetInnerHTML={{
								__html: message.message,
							}}
						/>
					</div>
				))}
			</div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="absolute bottom-0 w-full"
				>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<TipTap onChange={field.onChange} description={field.value} />
								</FormControl>
							</FormItem>
						)}
					/>

					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</main>
	);
}
