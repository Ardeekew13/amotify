import { UpdatedMemberExpense } from "@/hooks/useExpenseForm";
import { App, Button, Form, InputNumber, Modal } from "antd";

interface AddMoreItemsProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	loading: boolean;
	onAddItems: (items: any) => void;
	setSelectedUsers?: (users: UpdatedMemberExpense[]) => void;
	selectedUsers?: UpdatedMemberExpense[];
}

const AddMoreItems = ({
	open,
	setOpen,
	loading,
	onAddItems,
}: AddMoreItemsProps) => {
	const [form] = Form.useForm();
	const { message } = App.useApp();

	const handleSubmit = (values: { amount: number }) => {
		const { amount } = values;
		console.log("Submitted amount:", amount);
		if (!amount || amount <= 0) {
			return message.error("Amount must be greater than 0");
		}
		onAddItems(amount);
		// Close modal
		setOpen(false);
	};
	return (
		<Modal
			title="Add More Items"
			footer={
				<>
					<Button onClick={() => setOpen(false)}>Close</Button>
					<Button type="primary" form="addOns" htmlType="submit">
						Add Item
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
					<InputNumber placeholder="Enter amount" type="number" style={{width:"100%"}} />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default AddMoreItems;
