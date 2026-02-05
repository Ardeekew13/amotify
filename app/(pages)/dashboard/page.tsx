import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BanknoteIcon, Home, Users } from "lucide-react";

export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome to Amotify - Track shared expenses and settle balances easily
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Your Balance</CardTitle>
						<BanknoteIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">You owe</span>
							<span className="text-lg font-semibold text-red-600">₱0.00</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">
								You are owed
							</span>
							<span className="text-lg font-semibold text-green-600">
								₱0.00
							</span>
						</div>
						<div className="border-t pt-2 flex justify-between items-center">
							<span className="text-sm font-medium">Net balance</span>
							<span className="text-xl font-bold">₱0.00</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-2 pb-2">
						<CardTitle className="text-sm font-medium">
							Shared Expenses
						</CardTitle>
						<Home className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">To Be Determined Soon</div>
						<p className="text-xs text-muted-foreground">
							Active expense groups
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Outstanding Settlements
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Pending payments</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common tasks to get you started</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<p>Coming Soon</p>
					</CardContent>
				</Card>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>Latest updates in the system</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							No recent activity to display
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
