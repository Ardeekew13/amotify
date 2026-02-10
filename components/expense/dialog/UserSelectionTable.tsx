"use client";

import { useState, useEffect } from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { User } from "@/interface/userInterface";

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
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(() => {
		return initialSelectedUsers.map((user) => user._id);
	});

	useEffect(() => {
		setSelectedRowKeys(initialSelectedUsers.map((user) => user._id));
	}, [initialSelectedUsers]);

	const columns: TableColumnsType<User> = [
		{
			title: "First Name",
			dataIndex: "firstName",
			key: "firstName",
		},
		{
			title: "Last Name",
			dataIndex: "lastName",
			key: "lastName",
		},
		{
			title: "Username",
			dataIndex: "userName",
			key: "userName",
		},
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedKeys: React.Key[], selectedRows: User[]) => {
			setSelectedRowKeys(selectedKeys as string[]);
			onSelectionChange(selectedRows);
		},
	};

	return (
		<Table
			columns={columns}
			dataSource={users}
			rowKey="_id"
			rowSelection={rowSelection}
			pagination={{ pageSize: 10 }}
		/>
	);
}
