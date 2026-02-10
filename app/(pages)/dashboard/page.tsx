"use client";

import { useQuery } from "@apollo/client";
import { GET_DASHBOARD } from "@/app/api/graphql/dashboard";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { DashboardActionList } from "@/components/dashboard/DashboardActionList";
import { DashboardRecentExpenses } from "@/components/dashboard/DashboardRecentExpenses";
import { useAuthContext } from "@/components/auth/AuthProvider";
import Loading from "@/components/common/Loading";
import { Typography, Row, Col } from "antd";

const { Title, Text } = Typography;

export default function DashboardPage() {
	const { user } = useAuthContext();

	// Single optimized query for all dashboard data
	const { data, loading, error } = useQuery(GET_DASHBOARD, {
		skip: !user,
		fetchPolicy: "cache-and-network",
	});

	const isLoading = loading || !user;

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return (
			<div style={{ textAlign: 'center', padding: '40px 0' }}>
				<Text type="danger">
					Error loading dashboard data. Please try again later.
				</Text>
			</div>
		);
	}

	const dashboardData = data?.getDashboard?.data;
	const summary = dashboardData?.summary;
	const actionItems = dashboardData?.actionItems || [];
	const recentExpenses = dashboardData?.recentExpenses || [];

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
			<div>
				<Title level={1} style={{ margin: 0, marginBottom: 4 }}>Dashboard</Title>
				<Text type="secondary">
					Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening.
				</Text>
			</div>

			{summary && <DashboardSummaryCards summary={summary} />}

			<Row gutter={[24, 24]}>
				<Col xs={24} lg={10}>
					<DashboardActionList
						actionItems={actionItems}
						currentUserId={user?._id ?? ""}
					/>
				</Col>
				<Col xs={24} lg={14}>
					<DashboardRecentExpenses expenses={recentExpenses} />
				</Col>
			</Row>
		</div>
	);
}
