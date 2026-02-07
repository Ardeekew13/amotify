import { Badge } from "@/components/ui/badge";

interface ExpenseFormHeaderProps {
	expense?: any;
	permissions: any;
}

export const ExpenseFormHeader = ({ expense, permissions }: ExpenseFormHeaderProps) => {
	return (
		<div className="flex items-center justify-between mb-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{expense ? "Edit Expense" : "Add Expense"}
				</h1>
				<p className="text-muted-foreground">
					Manage and track your shared expenses{" "}
					{!permissions.isNewExpense && (
						<Badge variant={permissions.getBadgeVariant()}>
							{permissions.getBadgeText()}
						</Badge>
					)}
				</p>
			</div>
		</div>
	);
};