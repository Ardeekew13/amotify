"use client";
import FloatingButton from "@/components/common/FloatingButton";
import { LoadingOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ShowQRCode from "../dialog/ShowQRCode";
import { FormData } from "@/hooks/useExpenseForm";

interface ExpenseFormActionsProps {
	permissions: any;
	isUploading: boolean;
	upsertLoading: boolean;
	onMarkAsPaid: () => void;
	formData: FormData;
}

export const ExpenseFormActions = ({
	permissions,
	isUploading,
	upsertLoading,
	onMarkAsPaid,
	formData,
}: ExpenseFormActionsProps) => {
	const router = useRouter();
	const [showQr, setShowQr] = useState(false);

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
				icon={
					isLoading ? (
						<Spin indicator={<LoadingOutlined spin />} size="small" />
					) : null
				}
			>
				{isLoading ? loadingText : buttonText}
			</Button>
		);
	};

	const handleMarkAsPaid = () => {
		if (!permissions?.isCurrentUserPaid) {
			setShowQr(true);
		} else {
			onMarkAsPaid();
		}
	};

	const renderMarkAsPaidButton = () => {
		if (!permissions.canMarkAsPaid) return null;

		return (
			<Button
				type="primary"
				onClick={handleMarkAsPaid}
				disabled={isUploading || upsertLoading}
			>
				{permissions.getMarkAsPaidText()}
			</Button>
		);
	};

	return (
		<>
			<FloatingButton>
				<div style={{ display: "flex", gap: 16, marginLeft: "auto" }}>
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
			{showQr && (
				<ShowQRCode
					isOpen={showQr}
					onClose={() => setShowQr(false)}
					expense={formData}
					onMarkAsPaid={onMarkAsPaid}
				/>
			)}
		</>
	);
};
