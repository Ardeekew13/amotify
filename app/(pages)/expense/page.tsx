"use client";
import { GET_EXPENSES } from "@/app/api/graphql/expense";
import ExpenseTable from "@/components/expense/ExpenseTable";
import { Button, Spin, Tabs, Typography } from "antd";
import { GetExpenses } from "@/interface/common/common";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

const { Title, Text } = Typography;

export default function ExpensePage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("all");
	const [isNavigating, setIsNavigating] = useState(false);

	const { data, loading, refetch } = useQuery<GetExpenses>(GET_EXPENSES, {
		variables: { filter: activeTab === "my" ? "my" : null },
		fetchPolicy: "no-cache",
	});

	const handleAdd = useCallback(
		(id?: string) => {
			setIsNavigating(true);
			if (id) {
				router.push(`/expense/manage/${id}`);
				return;
			}
			router.push("/expense/manage");
		},
		[router],
	);

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		refetch({ filter: value === "my" ? "my" : null });
	};

	const tableProps = useMemo(() => {
		return {
			expenses: data?.getExpenses?.expenses ?? [],
			loading,
			onAdd: handleAdd,
		};
	}, [data, loading, handleAdd]);

	if (isNavigating) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<Spin size="large" />
			</div>
		);
	}
	console.log("isNavigating", isNavigating);
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
				<div>
					<Title level={1} style={{ margin: 0, marginBottom: 4 }}>Expenses</Title>
					<Text type="secondary">
						Manage and track your shared expenses
					</Text>
				</div>
				<Button type="primary" onClick={() => handleAdd()}>Add Expense</Button>
			</div>
			<Tabs
				activeKey={activeTab}
				onChange={handleTabChange}
				items={[
					{
						key: 'all',
						label: 'All Expenses',
						children: <ExpenseTable {...tableProps} />
					},
					{
						key: 'my',
						label: 'My Expenses',
						children: <ExpenseTable {...tableProps} />
					}
				]}
			/>
		</div>
	);
}
