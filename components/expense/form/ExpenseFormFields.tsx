import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MemberSelectTable from "@/components/expense/MemberTable";
import { ReceiptUpload } from "@/components/expense/ReceiptUpload";
import { Expense, MemberExpense } from "@/interface/common/common";
import { FormData } from "@/hooks/useExpenseForm";
import { useAuth } from "@/hooks/useAuth";

interface ExpenseFormFieldsProps {
	formData: FormData;
	setFormData: (updates: Partial<FormData>) => void;
	selectedUsers: MemberExpense[];
	setSelectedUsers: React.Dispatch<React.SetStateAction<MemberExpense[]>>;
	onOpenDialog: () => void;
	onRemoveMember: (userId: string) => void;
	permissions: any;
	expense?: Expense;
}

export const ExpenseFormFields = ({
	formData,
	setFormData,
	selectedUsers,
	setSelectedUsers,
	onOpenDialog,
	onRemoveMember,
	permissions,
	expense,
}: ExpenseFormFieldsProps) => {
	const { user } = useAuth();
	const isOwner = expense?.paidBy === user?._id;
	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						value={formData.title}
						onChange={(e) => setFormData({ title: e.target.value })}
						placeholder="Enter expense title"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="amount">Amount</Label>
					<Input
						type="number"
						id="amount"
						placeholder="0"
						value={formData.amount === 0 ? "" : formData.amount}
						onChange={(e) =>
							setFormData({ amount: parseFloat(e.target.value) || 0 })
						}
						onFocus={(e) => e.target.select()}
					/>
				</div>

				{expense && (
					<div className="space-y-2">
						<Label htmlFor="paidByUser">Paid By</Label>
						<Input
							id="paidByUser"
							value={
								formData.paidByUser?.firstName +
									" " +
									formData.paidByUser?.lastName || ""
							}
							placeholder="Enter who paid the expense"
							readOnly
						/>
					</div>
				)}
			</div>

			<div className="flex-1 min-h-0">
				<Label>Add Members</Label>
				<MemberSelectTable
					selectedUsers={selectedUsers}
					setSelectedUsers={setSelectedUsers}
					onOpenDialog={onOpenDialog}
					totalAmount={formData.amount}
					onRemoveMember={onRemoveMember}
					paidBy={formData.paidBy ?? ""}
					expenseId={formData.expenseId ?? ""}
				/>
			</div>

			<div className="space-y-2">
				<Label>Attachment</Label>
				<ReceiptUpload
					value={formData.receiptFile}
					onChange={(files) => setFormData({ receiptFile: files })}
					existingUrl={formData.existingReceiptUrl}
					multiple={true}
					maxFiles={5}
					someoneAlreadyPaid={permissions.someoneAlreadyPaid ?? false}
					isOwner={isOwner}
				/>
			</div>
		</>
	);
};
