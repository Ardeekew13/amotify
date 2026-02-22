import { FormData } from "@/hooks/useExpenseForm";
import { Expense } from "@/interface/common/common";
import { Image, Modal } from "antd";
import React from "react";

interface ShowQRCodeProps {
	isOpen: boolean;
	onClose: () => void;
	expense: FormData;
	onMarkAsPaid?: () => void;
}

const ShowQRCode = ({
	isOpen,
	onClose,
	expense,
	onMarkAsPaid,
}: ShowQRCodeProps) => {
	return (
		<Modal
			open={isOpen}
			onCancel={onClose}
			title="QR Code"
			width={900}
			onOk={onMarkAsPaid}
		>
			<div style={{ textAlign: "center" }}>
				<Image
					src={
						expense.paidByUser?.qrCodeUrl ||
						"https://via.placeholder.com/200x200.png?text=QR+Code"
					}
					alt="QR Code"
					width={500}
					height={600}
				/>
			</div>
		</Modal>
	);
};

export default ShowQRCode;
