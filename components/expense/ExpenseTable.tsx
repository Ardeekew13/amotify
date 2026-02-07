"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Expense, ExpenseStatus } from "@/interface/common/common";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";
import { Skeleton } from "../ui/skeleton";

interface IExpenseProps {
	expenses: Expense[];
	loading: boolean;
	onAdd: (id?: string) => void;
}

const ExpenseTable = ({ expenses, loading, onAdd }: IExpenseProps) => {
	const columns: ColumnDef<Expense>[] = [
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => <div>{row.getValue("title")}</div>,
			size: 200,
		},
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ row }) => {
				const amount = parseFloat(row.getValue("amount"));
				const formatted = new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: "PHP",
				}).format(amount);
				return <div className="font-semibold">{formatted}</div>;
			},
			size: 150,
		},
		{
			accessorKey: "paidByUser",
			header: "Paid By",
			cell: ({ row }) => (
				<div>
					{row.original?.paidByUser?.firstName +
						" " +
						row.original?.paidByUser?.lastName}
				</div>
			),
			size: 150,
		},
		{
			accessorKey: "createdAt",
			header: "Date",
			cell: ({ row }) => {
				const createdAt = dayjs(row.getValue("createdAt") as string);
				return (
					<div className="text-sm">
						<div className="font-medium">
							{createdAt.format("MMM DD, YYYY")}
						</div>
						<div className="text-muted-foreground text-xs">
							{createdAt.format("h:mm A")}
						</div>
					</div>
				);
			},
			size: 150,
		},
		{
			id: "status",
			header: () => <div className="text-center">Status</div>,
			cell: ({ row }) => {
				const status = row?.original?.status;
				const statusText =
					status === ExpenseStatus.AWAITING_PAYMENT
						? "Awaiting Payment"
						: "Completed";
				return (
					<span
						className={`flex px-4 text-center rounded-full text-xs font-medium ${
							status === ExpenseStatus.AWAITING_PAYMENT
								? "bg-blue-500 text-white py-1"
								: "bg-green-500 text-white py-2"
						}`}
					>
						{statusText}
					</span>
				);
			},
			size: 130,
		},
		{
			id: "actions",
			cell: ({ row }) => {
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onAdd(row?.original?._id)}>
								View Details
							</DropdownMenuItem>

							{/* <DropdownMenuItem className="text-red-600">
								Delete
							</DropdownMenuItem> */}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			size: 60,
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>All Expenses</CardTitle>
				<CardDescription>
					Here&apos;s a list of your expense records.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loading ? (
					<Skeleton className="h-64 w-full rounded-md" />
				) : (
					<DataTable columns={columns} data={expenses} />
				)}
			</CardContent>
		</Card>
	);
};

export default ExpenseTable;
