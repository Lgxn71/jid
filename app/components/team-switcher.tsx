import { Link, useLocation, useNavigate } from "@remix-run/react";
import { ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { OrgContext } from "~/context/orgContext";

export function TeamSwitcher() {
	const orgData = React.useContext(OrgContext);
	const navigate = useNavigate();
	const location = useLocation();
	const [activeTeam, setActiveTeam] = React.useState(orgData[0]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="w-full rounded-md ring-ring hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 data-[state=open]:bg-accent">
				<div className="flex items-center gap-1.5 overflow-hidden px-2 py-1.5 text-left text-sm transition-all">
					<div className="flex h-5 w-5 items-center justify-center rounded-sm bg-primary text-primary-foreground">
						{activeTeam && (
							<div className="h-3.5 w-3.5 shrink-0">
								{activeTeam.name.slice(0, 2)}
							</div>
						)}
					</div>
					<div className="line-clamp-1 flex-1 pr-2 font-medium">
						{activeTeam?.name}
					</div>
					<ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-64"
				align="start"
				side="right"
				sideOffset={4}
			>
				<DropdownMenuLabel className="text-xs text-muted-foreground">
					Teams
				</DropdownMenuLabel>
				{orgData.map((team, index) => (
					<DropdownMenuItem
						key={team.name}
						onClick={() => {
							console.log(
								location.pathname.replace(
									/\/dashboard\/[^/]+/,
									`/dashboard/${team.id}`,
								),
							);
							navigate(
								location.pathname.replace(
									/\/dashboard\/[^/]+/,
									`/dashboard/${team.id}`,
								),
							);
						}}
						className="items-start gap-2 px-1.5"
					>
						<div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
							{team.name.slice(0, 2)}
						</div>
						<div className="grid flex-1 leading-tight">
							<div className="line-clamp-1 font-medium">{team.name}</div>
							<div className="overflow-hidden text-xs text-muted-foreground">
								<div className="line-clamp-1">{team.id}</div>
							</div>
						</div>
						<DropdownMenuShortcut className="self-center">
							⌘{index + 1}
						</DropdownMenuShortcut>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="gap-2 px-1.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
						<Plus className="h-5 w-5" />
					</div>
					<Link
						className="font-medium text-muted-foreground"
						to="/organization"
					>
						Add workspace
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
