"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MemberExpense, MemberExpenseStatus } from "@/interface/common/common";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge, BadgeProps } from "../ui/badge";
import { useAuthContext } from "../auth/AuthProvider";
import { useMutation } from "@apollo/client/react";
import {
	CONFIRM_PAYMENT_RECEIVED,
	MARK_AS_PAID,
} from "@/app/api/graphql/expense";
import { toast } from "sonner";
import { formatPercentage, formatCurrency } from "@/lib/helper";

interface EditableAmountTableProps {
	data: MemberExpense[];
	onSplitPercentageChange: (userId: string, split: number) => void;
	onAmountChange: (userId: string, amount: number) => void;
	onRemoveMember: (userId: string) => void;
	paidBy?: string;
	expenseId?: string;
}

// Helper to determine badge variant
const getStatusBadgeVariant = (
	status: MemberExpenseStatus,
): BadgeProps["variant"] => {
	switch (status) {
		case MemberExpenseStatus.PAID:
			return "success";
		case MemberExpenseStatus.PENDING:
			return "warning";
		case MemberExpenseStatus.AWAITING_CONFIRMATION:
			return "info";
		default:
			return "default";
	}
};

// Reusable editable number input component
interface EditableNumberInputProps {
	value: number;
	userId: string;
	onChange: (userId: string, value: number) => void;
	placeholder?: string;
	className?: string;
}

function EditableNumberInput({ 
	value, 
	userId, 
	onChange, 
	placeholder = "0", 
	className = "w-32 text-right" 
}: EditableNumberInputProps) {
	// Show empty string for 0 values so users can type fresh
	const formatValue = (val: number) => val === 0 ? "" : String(val);
	
	const [localValue, setLocalValue] = useState(formatValue(value));

	// Update local value when prop changes
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
			e.currentTarget.blur();
		}
	};

	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		// Select all text on focus for easy replacement
		e.target.select();
	};

	return (
		<div className="flex justify-end">
			<Input
				type="number"
				value={localValue}
				placeholder={placeholder}
				className={className}
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
				toast.success(
					data?.markSplitAsPaid?.message || "Payment marked as received",
				);
			} else {
				toast.error(data?.markSplitAsPaid.message || "Failed to mark payment");
			}
		});
	};

	const columns: ColumnDef<MemberExpense>[] = [
		{
			accessorFn: (row) => `${row?.user?.firstName} ${row.user?.lastName}`,
			header: "Full Name",
			footer: () => <strong>Total:</strong>,
		},
		{
			id: "splitPercentage",
			header: () => <div className="text-right">Split (%)</div>,
			cell: ({ row }) => (
				<EditableNumberInput
					value={row.original.splitPercentage || 0}
					userId={row.original.user._id}
					onChange={onSplitPercentageChange}
				/>
			),
			footer: ({ table }) => {
				const total = table
					.getRowModel()
					.rows.reduce(
						(sum, row) => sum + (row.original.splitPercentage || 0),
						0,
					);

				return <div className="text-right font-bold">{formatPercentage(total)}</div>;
			},
		},
		{
			id: "amount",
			header: () => <div className="text-right">Amount</div>,
			cell: ({ row }) => (
				<EditableNumberInput
					value={row.original.amount || 0}
					userId={row.original.user._id}
					onChange={onAmountChange}
				/>
			),
			size: 80,
			footer: ({ table }) => {
				const total = table
					.getRowModel()
					.rows.reduce((sum, row) => sum + (row.original.amount || 0), 0);

				return <div className="text-right font-bold">{formatCurrency(total)}</div>;
			},
		},
		{
			id: "status",
			header: () => <div className="text-center">Status</div>,
			cell: ({ row }) => {
				return (
					<div className="flex justify-center">
						<Badge
							className="text-center"
							variant={getStatusBadgeVariant(row.original.status)}
						>
							{row.original.status === MemberExpenseStatus.PAID
								? "Paid"
								: row.original.status ===
									  MemberExpenseStatus.AWAITING_CONFIRMATION
									? "Awaiting Confirmation"
									: "Pending"}
						</Badge>
					</div>
				);
			},
			size: 80,
		},
	];

	// Conditionally add the "Actions" column
	const isPaidByCurrentUser = paidBy === user?._id;

	if (isPaidByCurrentUser) {
		columns.push({
			id: "actions",
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const isMemberRow = row.original.user?._id !== user?._id;
				const canMarkAsPaid =
					isMemberRow &&
					row.original.status === MemberExpenseStatus.AWAITING_CONFIRMATION;

				return (
					<div className="flex justify-center items-center gap-2">
						{canMarkAsPaid && (
							<Button
								variant="success"
								size="xs"
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onReceivePayment(row.original.user._id);
								}}
							>
								Receive Payment
							</Button>
						)}
						<Button
							type="button"
							variant="destructive"
							size="xs"
							onClick={(e) => {
								e.stopPropagation();
								onRemoveMember(row.original.user._id);
							}}
						>
							Remove
						</Button>
					</div>
				);
			},
			size: 100,
		});
	}

	if (loading) {
		return <div className="flex items-center justify-center py-8">Processing payment...</div>;
	}

	return <DataTable columns={columns} data={data} />;
}
