"use client";

import { useQuery } from "@apollo/client";
import { GET_DASHBOARD } from "@/app/api/graphql/dashboard";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { DashboardActionList } from "@/components/dashboard/DashboardActionList";
import { DashboardRecentExpenses } from "@/components/dashboard/DashboardRecentExpenses";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "@/components/common/Loading";

export default function DashboardPage() {
	const { user } = useAuthContext();

	// Single optimized query for all dashboard data
	const { data, loading, error } = useQuery(GET_DASHBOARD, {
		skip: !user,
		fetchPolicy: "cache-and-network",
	});

	const isLoading = loading || !user;

	if (isLoading) {
		<Loading />;
	}

	if (error) {
		return (
			<div className="text-center py-10">
				<p className="text-red-500">
					Error loading dashboard data. Please try again later.
				</p>
			</div>
		);
	}

	const dashboardData = data?.getDashboard?.data;
	const summary = dashboardData?.summary;
	const actionItems = dashboardData?.actionItems || [];
	const recentExpenses = dashboardData?.recentExpenses || [];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening.
				</p>
			</div>

			{summary && <DashboardSummaryCards summary={summary} />}

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
				<div className="lg:col-span-2">
					<DashboardActionList
						actionItems={actionItems}
						currentUserId={user?._id ?? ""}
					/>
				</div>
				<div className="lg:col-span-3">
					<DashboardRecentExpenses expenses={recentExpenses} />
				</div>
			</div>
		</div>
	);
}
