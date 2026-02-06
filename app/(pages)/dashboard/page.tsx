"use client";

import { useQuery } from "@apollo/client";
import {
	GET_DASHBOARD_SUMMARY,
	GET_DASHBOARD_ACTION_ITEMS,
	GET_DASHBOARD_RECENT_EXPENSES,
} from "@/app/api/graphql/dashboard";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { DashboardActionList } from "@/components/dashboard/DashboardActionList";
import { DashboardRecentExpenses } from "@/components/dashboard/DashboardRecentExpenses";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
	const { user } = useAuthContext();

	const {
		data: summaryData,
		loading: summaryLoading,
		error: summaryError,
	} = useQuery(GET_DASHBOARD_SUMMARY, {
		skip: !user,
		fetchPolicy: "cache-and-network",
	});

	const {
		data: actionItemsData,
		loading: actionItemsLoading,
		error: actionItemsError,
	} = useQuery(GET_DASHBOARD_ACTION_ITEMS, {
		skip: !user,
		fetchPolicy: "cache-and-network",
	});

	const {
		data: recentExpensesData,
		loading: recentExpensesLoading,
		error: recentExpensesError,
	} = useQuery(GET_DASHBOARD_RECENT_EXPENSES, {
		skip: !user,
		fetchPolicy: "cache-and-network",
	});

	const loading =
		summaryLoading || actionItemsLoading || recentExpensesLoading || !user;
	const error = summaryError || actionItemsError || recentExpensesError;

	if (loading) {
		return (
			<div className="space-y-6">
				<div>
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-96 mt-2" />
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
					<div className="lg:col-span-2">
						<Skeleton className="h-64" />
					</div>
					<div className="lg:col-span-3">
						<Skeleton className="h-64" />
					</div>
				</div>
			</div>
		);
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

	const summary = summaryData?.getDashboardSummary?.data;
	const actionItems = actionItemsData?.getDashboardActionItems?.data || [];
	const recentExpenses =
		recentExpensesData?.getDashboardRecentExpenses?.data || [];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back, {user.firstName}! Here&apos;s what&apos;s happening.
				</p>
			</div>

			{summary && <DashboardSummaryCards summary={summary} />}

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
				<div className="lg:col-span-2">
					<DashboardActionList
						actionItems={actionItems}
						currentUserId={user._id}
					/>
				</div>
				<div className="lg:col-span-3">
					<DashboardRecentExpenses expenses={recentExpenses} />
				</div>
			</div>
		</div>
	);
}
