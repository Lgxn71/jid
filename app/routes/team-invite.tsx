import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Mic, Video, Monitor, Smile, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { useToast } from "~/hooks/use-toast";

export default function Page() {
	const navigate = useNavigate();

	const { toast } = useToast();

	const [teamID, setTeamId] = useState("XyZ1234Gg");
	const handleCopyInviteID = () => {
		navigator.clipboard.writeText(teamID);
		toast({
			title: "Copied to clipboard",
			description: "Invite ID has been copied to your clipboard.",
		});
	};

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Left Panel */}
			<div className="max-w-[500px] bg-gray-900 text-white p-8">
				<div className="max-w-md mx-auto">
					<div className="mb-2 text-sm text-gray-400">Step 2 of 2</div>
					<h2 className="text-3xl font-bold mb-4">Invite your team</h2>
					<p className="text-gray-400 mb-6">
						When your whole team is on JID, the conversation moves faster
						because everyone can join in.
					</p>

					<div className="mb-6">
						<p className="block text-sm font-medium mb-2">
							Invite People using this ID
						</p>
						<div className="flex gap-[25px] flex-row items-center mb-2">
							<div className="p-2 rounded-xl bg-gray-800 border-gray-700 text-white">
								{teamID}
							</div>
						</div>
					</div>
					<div className="flex space-x-4">
						<Button
							onClick={() => navigate("/")}
							variant="outline"
							className="flex-grow border-gray-600 text-gray-900 hover:bg-gray-800 hover:text-white"
						>
							Next
						</Button>
						<Button
							onClick={handleCopyInviteID}
							variant="default"
							className="flex-grow border-gray-600 text-gray-300 hover:bg-gray-800"
						>
							Copy Invite ID
						</Button>
					</div>
					<div className="mt-4 text-center">
						<Button
							onClick={() => navigate("/")}
							variant="link"
							className="text-gray-400 hover:text-gray-300"
						>
							Skip this step
						</Button>
					</div>
				</div>
			</div>

			{/* Right Panel */}
			<div className="flex-1 p-8 flex items-center justify-center bg-gray-50">
				<Card className="w-full max-w-2xl border-none aspect-video bg-indigo-200 p-4 shadow-lg">
					<div className="grid grid-cols-2 gap-4 h-full">
						{[
							{ bg: "bg-pink-200", shirt: "bg-orange-400", letter: "A" },
							{ bg: "bg-pink-200", shirt: "bg-purple-600", letter: "B" },
							{ bg: "bg-pink-200", shirt: "bg-sky-400", letter: "D" },
							{ bg: "bg-pink-200", shirt: "bg-sky-400", letter: "C" },
						].map((item, index) => (
							<div
								key={index}
								className={`${item.bg} rounded-lg flex items-center justify-center`}
							>
								<div
									className={`flex  w-16 h-16 text-center items-center justify-center ${item.shirt} rounded-full`}
								>
									{item.letter}
								</div>
							</div>
						))}
					</div>
					<div className="flex justify-center mt-4 space-x-2">
						{[Mic, Video, Monitor, Smile, Settings].map((Icon, index) => (
							<Button
								key={index}
								variant="secondary"
								size="icon"
								className="bg-white hover:bg-gray-100"
							>
								<Icon className="h-4 w-4 text-gray-600" />
							</Button>
						))}
						<Button className="bg-red-500 hover:bg-red-600 text-white px-4">
							End
						</Button>
					</div>
				</Card>
			</div>
		</div>
	);
}
