"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/interface/userInterface";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";

interface UserSelectionTableProps {
	users: User[];
	onSelectionChange: (selectedUsers: User[]) => void;
	initialSelectedUsers?: User[];
}

export function UserSelectionTable({
	users,
	onSelectionChange,
	initialSelectedUsers = [],
}: UserSelectionTableProps) {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
		const initialSelection: RowSelectionState = {};
		initialSelectedUsers.forEach((user) => {
			const index = users.findIndex((u) => u._id === user._id);
			if (index !== -1) {
				initialSelection[index] = true;
			}
		});
		return initialSelection;
	});

	const columns: ColumnDef<User>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(checked) =>
						table.toggleAllPageRowsSelected(!!checked)
					}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(checked) => row.toggleSelected(!!checked)}
				/>
			),
		},
		{
			accessorKey: "firstName",
			header: "First Name",
		},
		{
			accessorKey: "lastName",
			header: "Last Name",
		},
		{
			accessorKey: "userName",
			header: "Username",
		},
	];

	// Handle selection changes
	const handleRowSelectionChange = (updater: any) => {
		const newSelection =
			typeof updater === "function" ? updater(rowSelection) : updater;
		setRowSelection(newSelection);

		// Get selected users
		const selectedIndexes = Object.keys(newSelection).filter(
			(key) => newSelection[key],
		);
		const selectedUsers = selectedIndexes.map(
			(index) => users[parseInt(index)],
		);

		onSelectionChange(selectedUsers);
	};

	return (
		<DataTable
			columns={columns}
			data={users}
			rowSelection={rowSelection}
			onRowSelectionChange={handleRowSelectionChange}
		/>
	);
}
