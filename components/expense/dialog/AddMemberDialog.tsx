"use client";

import { GET_USERS_EXCLUDE_SELF } from "@/app/api/graphql/user";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberExpense, MemberExpenseStatus } from "@/interface/common/common";
import { User } from "@/interface/userInterface";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { UserSelectionTable } from "./UserSelectionTable";
import { useAuthContext } from "@/components/auth/AuthProvider";

interface GetUsersData {
	getUsersExcludeSelf: { success: boolean; message: string; users: User[] };
}

interface AddMemberDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (members: MemberExpense[]) => void;
	currentMembers?: MemberExpense[];
	setSelectedUsers?: (users: MemberExpense[]) => void;
}

const AddMemberDialog = ({
	isOpen,
	onClose,
	onConfirm,
	currentMembers = [],
}: AddMemberDialogProps) => {
	const { user } = useAuthContext();
	const { data, loading, error } = useQuery<GetUsersData>(
		GET_USERS_EXCLUDE_SELF,
		{
			variables: { _id: user?._id },
			skip: !user,
		},
	);

	const userLists = data?.getUsersExcludeSelf.users || [];
	const [selectedUsers, setLocalSelectedUsers] = useState<User[]>([]);

	useEffect(() => {
		const initialUsers = currentMembers.map((member) => member.user);
		if (
			user &&
			!initialUsers.some((initialUser) => initialUser._id === user._id)
		) {
			const fullUser = { ...user, createdAt: "", updatedAt: "" };
			setLocalSelectedUsers([fullUser, ...initialUsers]);
		} else {
			setLocalSelectedUsers(initialUsers);
		}
	}, [isOpen, currentMembers, user]);

	const handleSelectionChange = (users: User[]) => {
		setLocalSelectedUsers(users);
	};
	const handleAddMembers = () => {
		// Map selected users to MemberExpense format
		const newMembers: MemberExpense[] = selectedUsers.map((user) => ({
			_id: user._id,
			amount: 0,
			splitPercentage: 0,
			user: user,
			status: MemberExpenseStatus.PENDING,
		}));

		onConfirm(newMembers);
		onClose();
	};

	const allUsers = [
		...userLists,
		...(user && !userLists.some((u) => u._id === user._id)
			? [{ ...user, createdAt: "", updatedAt: "" }]
			: []),
	];

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Add Members</DialogTitle>
					<DialogDescription>
						Select users to add to this expense
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					{loading ? (
						<div className="space-y-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : (
						<UserSelectionTable
							users={allUsers}
							onSelectionChange={handleSelectionChange}
							initialSelectedUsers={selectedUsers}
						/>
					)}
				</div>{" "}
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleAddMembers}>Add Selected Members</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddMemberDialog;
