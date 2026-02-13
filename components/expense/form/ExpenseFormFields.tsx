import MemberSelectTable from "@/components/expense/MemberTable";
import { ReceiptUpload } from "@/components/expense/ReceiptUpload";
import { FormData, UpdatedMemberExpense } from "@/hooks/useExpenseForm";
import { Expense } from "@/interface/common/common";
import { Col, Input, Row, Typography } from "antd";

const { Text } = Typography;

interface ExpenseFormFieldsProps {
	formData: FormData;
	setFormData: (updates: Partial<FormData>) => void;
	selectedUsers: UpdatedMemberExpense[];
	setSelectedUsers: React.Dispatch<
		React.SetStateAction<UpdatedMemberExpense[]>
	>;
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
	return (
		<>
			<Row gutter={16}>
				<Col xs={24} md={8}>
					<div style={{ marginBottom: 8 }}>
						<Text strong>Title</Text>
					</div>
					<Input
						id="title"
						value={formData.title}
						onChange={(e) => setFormData({ title: e.target.value })}
						placeholder="Enter expense title"
						required
					/>
				</Col>

				<Col xs={24} md={8}>
					<div style={{ marginBottom: 8 }}>
						<Text strong>Amount</Text>
					</div>
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
				</Col>

				{expense && (
					<Col xs={24} md={8}>
						<div style={{ marginBottom: 8 }}>
							<Text strong>Paid By</Text>
						</div>
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
					</Col>
				)}
			</Row>

			<div style={{ marginTop: 24 }}>
				<div style={{ marginBottom: 8 }}>
					<Text strong>Add Members</Text>
				</div>
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

			<div style={{ marginTop: 24 }}>
				<div style={{ marginBottom: 8 }}>
					<Text strong>Attachment</Text>
				</div>
				<ReceiptUpload
					value={formData.receiptFile}
					onChange={(files) => setFormData({ receiptFile: files })}
					existingUrl={formData.existingReceiptUrl}
					multiple={true}
					maxFiles={5}
					someoneAlreadyPaid={permissions.someoneAlreadyPaid ?? false}
					record={expense || null}
				/>
			</div>
		</>
	);
};
