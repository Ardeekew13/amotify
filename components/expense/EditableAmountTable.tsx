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

// Separate component for editable split percentage cell
function EditableSplitCell({
	row,
	onSplitPercentageChange,
}: {
	row: any;
	onSplitPercentageChange: (userId: string, split: number) => void;
}) {
	const [localValue, setLocalValue] = useState(
		String(row.original.splitPercentage || 0),
	);

	useEffect(() => {
		setLocalValue(String(row.original.splitPercentage || 0));
	}, [row.original.splitPercentage]);

	const handleBlur = () => {
		const numValue = parseFloat(localValue) || 0;
		if (numValue !== row.original.splitPercentage) {
			onSplitPercentageChange(row.original._id, numValue);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
		}
	};

	return (
		<div className="flex justify-end">
			<Input
				type="number"
				value={localValue}
				className="w-32 text-right"
				onChange={(e) => setLocalValue(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
}

// Separate component for editable amount cell
function EditableAmountCell({
	row,
	onAmountChange,
}: {
	row: any;
	onAmountChange: (userId: string, amount: number) => void;
}) {
	const [localValue, setLocalValue] = useState(
		String(row.original.amount || 0),
	);

	useEffect(() => {
		setLocalValue(String(row.original.amount || 0));
	}, [row.original.amount]);

	const handleBlur = () => {
		const numValue = parseFloat(localValue) || 0;
		if (numValue !== row.original.amount) {
			onAmountChange(row.original._id, numValue);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
		}
	};

	return (
		<div className="flex justify-end">
			<Input
				type="number"
				value={localValue}
				className="w-32 text-right"
				onChange={(e) => setLocalValue(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
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
				<EditableSplitCell
					row={row}
					onSplitPercentageChange={onSplitPercentageChange}
				/>
			),

			footer: ({ table }) => {
				const total = table
					.getRowModel()
					.rows.reduce(
						(sum, row) => sum + (row.original.splitPercentage || 0),
						0,
					);

				return <div className="text-right font-bold">{total.toFixed(1)}%</div>;
			},
		},
		{
			id: "amount",
			header: () => <div className="text-right">Amount</div>,
			cell: ({ row }) => (
				<EditableAmountCell row={row} onAmountChange={onAmountChange} />
			),
			size: 80,
			footer: ({ table }) => {
				const total = table
					.getRowModel()
					.rows.reduce((sum, row) => sum + (row.original.amount || 0), 0);

				return <div className="text-right font-bold">₱{total.toFixed(2)}</div>;
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

	return <DataTable columns={columns} data={data} />;
}
