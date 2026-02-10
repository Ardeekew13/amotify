import { Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import FloatingButton from "@/components/common/FloatingButton";
import { useRouter } from "next/navigation";

interface ExpenseFormActionsProps {
	permissions: any;
	isUploading: boolean;
	upsertLoading: boolean;
	onMarkAsPaid: () => void;
}

export const ExpenseFormActions = ({
	permissions,
	isUploading,
	upsertLoading,
	onMarkAsPaid,
}: ExpenseFormActionsProps) => {
	const router = useRouter();

	const renderSubmitButton = () => {
		if (!permissions.canEdit) return null;

		const isLoading = upsertLoading || isUploading;
		const buttonText = permissions.getSubmitButtonText();
		const loadingText = permissions.getLoadingText();

		return (
			<Button
				type="primary"
				htmlType="submit"
				disabled={isLoading}
				icon={isLoading ? <Spin indicator={<LoadingOutlined spin />} size="small" /> : null}
			>
				{isLoading ? loadingText : buttonText}
			</Button>
		);
	};

	const renderMarkAsPaidButton = () => {
		if (!permissions.canMarkAsPaid) return null;

		return (
			<Button onClick={onMarkAsPaid}>
				{permissions.getMarkAsPaidText()}
			</Button>
		);
	};

	return (
		<FloatingButton>
			<div style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
				<Button
					disabled={upsertLoading || isUploading}
					onClick={() => router.push("/expense")}
				>
					Cancel
				</Button>
				{renderSubmitButton()}
				{renderMarkAsPaidButton()}
			</div>
		</FloatingButton>
	);
};