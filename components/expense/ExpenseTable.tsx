"use client";

import { Button, Card, Table, Dropdown, Tag, Skeleton } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import type { MenuProps, TableColumnsType } from "antd";
import { Expense, ExpenseStatus } from "@/interface/common/common";
import dayjs from "dayjs";

interface IExpenseProps {
	expenses: Expense[];
	loading: boolean;
	onAdd: (id?: string) => void;
}

const ExpenseTable = ({ expenses, loading, onAdd }: IExpenseProps) => {
	const getMenuItems = (record: Expense): MenuProps["items"] => [
		{
			key: "view",
			label: "View Details",
			onClick: () => onAdd(record._id),
		},
	];

	const columns: TableColumnsType<Expense> = [
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			width: 350,
		},
		{
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
			width: 300,
			render: (amount: number) => {
				const formatted = new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: "PHP",
				}).format(amount);
				return <span style={{ fontWeight: 600 }}>{formatted}</span>;
			},
		},
		{
			title: "Paid By",
			dataIndex: "paidByUser",
			key: "paidByUser",
			width: 300,
			render: (paidByUser: any) =>
				`${paidByUser?.firstName || ""} ${paidByUser?.lastName || ""}`,
		},
		{
			title: "Date",
			dataIndex: "createdAt",
			key: "createdAt",
			width: 200,
			render: (createdAt: string) => {
				const date = dayjs(createdAt);
				return (
					<div>
						<div style={{ fontWeight: 500 }}>{date.format("MMM DD, YYYY")}</div>
						<div style={{ fontSize: "12px", color: "#6b7280" }}>
							{date.format("h:mm A")}
						</div>
					</div>
				);
			},
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: 40,
			align: "center",
			render: (status: ExpenseStatus) => {
				const isAwaiting = status === ExpenseStatus.AWAITING_PAYMENT;
				return (
					<Tag
						variant="solid"
						color={isAwaiting ? "blue" : "green"}
						style={{
							fontSize: "14px",
							padding: "4px 8px",
							fontWeight: 500,
						}}
					>
						{isAwaiting ? "Awaiting Payment" : "Completed"}
					</Tag>
				);
			},
		},
		{
			title: "Actions",
			key: "actions",
			width: 20,
			render: (_, record) => (
				<Dropdown menu={{ items: getMenuItems(record) }} trigger={["click"]}>
					<Button type="text" icon={<MoreOutlined />} />
				</Dropdown>
			),
		},
	];

	return (
		<Card
			title="All Expenses"
			extra={
				<span style={{ color: "#6b7280", fontSize: "14px" }}>
					Here&apos;s a list of your expense records.
				</span>
			}
		>
			{loading ? (
				<Skeleton active paragraph={{ rows: 8 }} />
			) : (
				<Table
					columns={columns}
					dataSource={expenses}
					rowKey="_id"
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showTotal: (total) => `Total ${total} expenses`,
					}}
				/>
			)}
		</Card>
	);
};

export default ExpenseTable;
