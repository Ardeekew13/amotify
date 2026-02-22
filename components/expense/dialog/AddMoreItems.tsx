import { MemberExpense } from "@/interface/common/common";
import { App, Button, Form, InputNumber, Modal } from "antd";

interface AddMoreItemsProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	loading: boolean;
	onAddItems: (items: any) => void;
	setSelectedUsers?: (users: MemberExpense[]) => void;
	selectedUsers?: MemberExpense[];
	type: String;
}

const AddMoreItems = ({
	open,
	setOpen,
	loading,
	onAddItems,
	type,
}: AddMoreItemsProps) => {
	const [form] = Form.useForm();
	const { message } = App.useApp();

	const handleSubmit = (values: { amount: number }) => {
		const { amount } = values;
		if (!amount || amount <= 0) {
			return message.error("Amount must be greater than 0");
		}
		onAddItems(amount);
		// Close modal
		setOpen(false);
	};
	return (
		<Modal
			title={type === "ADD_ON" ? "Add Additional Items" : "Add Deduction"}
			footer={
				<>
					<Button onClick={() => setOpen(false)}>Close</Button>
					<Button type="primary" form="addOns" htmlType="submit">
						{type === "ADD_ON" ? "Add Additional Items" : "Add Deduction"}
					</Button>
				</>
			}
			loading={loading}
			open={open}
			onCancel={() => setOpen(false)}
		>
			<Form form={form} onFinish={handleSubmit} layout="vertical" name="addOns">
				<Form.Item
					label="Amount"
					name="amount"
					rules={[{ required: true, message: "Please enter an amount" }]}
				>
					<InputNumber
						placeholder="Enter amount"
						type="number"
						style={{ width: "100%" }}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default AddMoreItems;
