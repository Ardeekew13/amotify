"use client";

import {
	MARK_AS_PAID
} from "@/app/api/graphql/expense";
import { MemberExpense, MemberExpenseStatus } from "@/interface/common/common";
import { formatCurrency, formatPercentage } from "@/lib/helper";
import { useMutation } from "@apollo/client/react";
import type { TableColumnsType } from "antd";
import { App, Button, Input, Table, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../auth/AuthProvider";

interface EditableAmountTableProps {
	data: MemberExpense[];
	onSplitPercentageChange: (userId: string, split: number) => void;
	onAmountChange: (userId: string, amount: number) => void;
	onRemoveMember: (userId: string) => void;
	paidBy?: string;
	expenseId?: string;
}

// Reusable editable number input component
interface EditableNumberInputProps {
	value: number;
	userId: string;
	onChange: (userId: string, value: number) => void;
	placeholder?: string;
}

function EditableNumberInput({
	value,
	userId,
	onChange,
	placeholder = "0",
}: EditableNumberInputProps) {
	const formatValue = (val: number) => (val === 0 ? "" : String(val));
	const [localValue, setLocalValue] = useState(formatValue(value));

	useEffect(() => {
		setLocalValue(formatValue(value));
	}, [value]);

	const handleSubmit = () => {
		const numValue = parseFloat(localValue) || 0;
		if (numValue !== value) {
			onChange(userId, numValue);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			(e.target as HTMLInputElement).blur();
		}
	};

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		e.target.select();
	};

	return (
		<div style={{ display: "flex", justifyContent: "flex-end" }}>
			<Input
				type="number"
				value={localValue}
				placeholder={placeholder}
				style={{ width: 120, textAlign: "right" }}
				onChange={(e) => setLocalValue(e.target.value)}
				onBlur={handleSubmit}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
			/>
		</div>
	);
}

export function EditableAmountTable({
	data,
	onSplitPercentageChange,
	onAmountChange,
	onRemoveMember,
	paidBy,
	expenseId,
}: EditableAmountTableProps) {
	const { user } = useAuthContext();
	const { message } = App.useApp();
	const [markReceivePayment, { loading }] = useMutation(MARK_AS_PAID);

	const onReceivePayment = (userId: string) => {
		markReceivePayment({
			variables: {
				input: {
					expenseId,
					memberId: userId,
					type: "RECEIVED",
				},
			},
		}).then((result) => {
			const data = result.data as any;
			if (data?.markSplitAsPaid.success) {
				message.success(
					data?.markSplitAsPaid?.message || "Payment marked as received",
				);
			} else {
				message.error(
					data?.markSplitAsPaid.message || "Failed to mark payment",
				);
			}
		});
	};

	const isPaidByCurrentUser = paidBy === user?._id;

	const columns: TableColumnsType<MemberExpense> = [
		{
			title: "Full Name",
			key: "fullName",
			render: (_, record) =>
				`${record.user?.firstName} ${record.user?.lastName}`,
		},
		{
			title: <div style={{ textAlign: "right" }}>Split (%)</div>,
			key: "splitPercentage",
			width: 100,
			align: "right",
			render: (_, record) => (
				<EditableNumberInput
					value={record.splitPercentage || 0}
					userId={record.user._id}
					onChange={onSplitPercentageChange}
				/>
			),
		},
		{
			title: <div style={{ textAlign: "right" }}>Amount</div>,
			key: "amount",
			width: 100,
			align: "right",
			render: (_, record) => (
				<EditableNumberInput
					value={record.amount || 0}
					userId={record.user._id}
					onChange={onAmountChange}
				/>
			),
		},
		{
			title: <div style={{ textAlign: "center" }}>Status</div>,
			key: "status",
			align: "center",
			width: 80,
			render: (_, record) => {
				const status = record.status;
				let color = "default";
				let text = "Pending";

				if (status === MemberExpenseStatus.PAID) {
					color = "green";
					text = "Paid";
				} else if (status === MemberExpenseStatus.AWAITING_CONFIRMATION) {
					color = "blue";
					text = "Awaiting Confirmation";
				} else if (status === MemberExpenseStatus.PENDING) {
					color = "gold";
					text = "Pending";
				}

				return (
					<Tag
						style={{
							fontSize: "14px",
							padding: "4px 8px",
							fontWeight: 500,
						}}
						color={color}
					>
						{text}
					</Tag>
				);
			},
		},
	];

	if (isPaidByCurrentUser) {
		columns.push({
			title: <div style={{ textAlign: "center" }}>Actions</div>,
			key: "actions",
			align: "center",
			width: 120,
			render: (_, record) => {
				const isMemberRow = record.user?._id !== user?._id;
				const canMarkAsPaid =
					isMemberRow &&
					record.status === MemberExpenseStatus.AWAITING_CONFIRMATION;

				return (
					<div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
						{canMarkAsPaid && (
							<Button
								type="primary"
								size="small"
								onClick={(e) => {
									e.stopPropagation();
									onReceivePayment(record.user._id);
								}}
								style={{ backgroundColor: "#22c55e" }}
							>
								Receive Payment
							</Button>
						)}
						<Button
							danger
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								onRemoveMember(record.user._id);
							}}
						>
							Remove
						</Button>
					</div>
				);
			},
		});
	}

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: 32 }}>
				Processing payment...
			</div>
		);
	}

	const totalSplit = data.reduce(
		(sum, item) => sum + (item.splitPercentage || 0),
		0,
	);
	const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0);

	return (
		<Table
			columns={columns}
			dataSource={data}
			rowKey={(record) => record.user._id}
			pagination={false}
			summary={() => (
				<Table.Summary.Row>
					<Table.Summary.Cell index={0}>
						<strong>Total:</strong>
					</Table.Summary.Cell>
					<Table.Summary.Cell index={1}>
						<div style={{ textAlign: "right", fontWeight: "bold" }}>
							{formatPercentage(totalSplit)}
						</div>
					</Table.Summary.Cell>
					<Table.Summary.Cell index={2}>
						<div style={{ textAlign: "right", fontWeight: "bold" }}>
							{formatCurrency(totalAmount)}
						</div>
					</Table.Summary.Cell>
					<Table.Summary.Cell index={3} />
					{isPaidByCurrentUser && <Table.Summary.Cell index={4} />}
				</Table.Summary.Row>
			)}
		/>
	);
}
