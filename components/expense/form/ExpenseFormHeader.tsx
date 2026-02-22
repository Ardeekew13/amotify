import { ExpenseStatus } from "@/interface/common/common";
import { Tag, Typography } from "antd";

const { Title, Text } = Typography;

interface ExpenseFormHeaderProps {
	expense?: any;
	permissions: any;
}

export const ExpenseFormHeader = ({
	expense,
	permissions,
}: ExpenseFormHeaderProps) => {
	const getBadgeColor = () => {
		if (expense?.status === ExpenseStatus.AWAITING_PAYMENT) return "blue";
		if (expense?.status === ExpenseStatus.COMPLETED) return "green";
	};

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				marginBottom: 24,
			}}
		>
			<div>
				<Title level={1} style={{ margin: 0, marginBottom: 4 }}>
					{expense ? "Edit Expense" : "Add Expense"}
				</Title>
				<Text type="secondary">
					Manage and track your shared expenses{" "}
					{!permissions.isNewExpense && (
						<Tag color={getBadgeColor()} style={{ marginLeft: 8 }}>
							{permissions.getBadgeText()}
						</Tag>
					)}
				</Text>
			</div>
		</div>
	);
};
