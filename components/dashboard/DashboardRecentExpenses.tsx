"use client";

import { Expense, ExpenseStatus } from "@/interface/common/common";
import { Card, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useAuthContext } from "@/components/auth/AuthProvider";

const { Text } = Typography;

interface DashboardRecentExpensesProps {
	expenses: Expense[];
}

export const DashboardRecentExpenses = ({
	expenses,
}: DashboardRecentExpensesProps) => {
	const { user } = useAuthContext();
	const columns: TableColumnsType<Expense> = [
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			width: 250,
			render: (title: string, record: Expense) => (
				<Link
					href={`/expense/manage/${record._id}`}
					style={{ fontWeight: 500, textDecoration: "none", color: "#000" }}
				>
					{title}
				</Link>
			),
		},
		{
			title: "Paid By",
			dataIndex: "paidByUser",
			key: "paidByUser",
			render: (paidByUser: any) =>
				`${paidByUser.firstName} ${paidByUser.lastName}`,
		},
		{
			title: "Amount",
			dataIndex: "split",
			key: "amount",
			render: (split: any[], record: Expense) => {
				// Find the current user's split amount
				const userSplit = split?.find((s) => s.user._id === user?._id);
				const amount = userSplit?.amount || 0;
				return formatCurrency(amount);
			},
		},
		{
			title: "Date",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			align: "center",
			render: (status: ExpenseStatus) => {
				const isCompleted = status === ExpenseStatus.COMPLETED;
				return (
					<Tag
						variant="solid"
						color={isCompleted ? "green" : "blue"}
						style={{
							fontSize: "14px",
							padding: "4px 8px",
							fontWeight: 500,
						}}
					>
						{status === ExpenseStatus.AWAITING_PAYMENT
							? "Awaiting Payment"
							: "Completed"}
					</Tag>
				);
			},
		},
	];

	return (
		<Card
			title="Recent Expenses"
			extra={
				<Text type="secondary" style={{ fontSize: 14 }}>
					Your 5 most recently updated expenses.
				</Text>
			}
		>
			<Table
				columns={columns}
				dataSource={expenses}
				rowKey="_id"
				pagination={false}
				locale={{
					emptyText: "No recent expenses found.",
				}}
			/>
		</Card>
	);
};
