"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { MemberExpense } from "@/interface/common/common";
import { CheckIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditableAmountTable } from "./EditableAmountTable";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth/AuthProvider";

interface IProps {
	selectedUsers: MemberExpense[];
	setSelectedUsers: React.Dispatch<React.SetStateAction<MemberExpense[]>>;
	onOpenDialog: () => void;
	totalAmount?: number;
	onRemoveMember: (userId: string) => void;
	paidBy?: string;
	expenseId: string;
}
const MemberSelectTable = ({
	selectedUsers,
	setSelectedUsers,
	onOpenDialog,
	totalAmount = 0,
	onRemoveMember,
	paidBy,
	expenseId,
}: IProps) => {
	const [isSplitEvenly, setIsSplitEvenly] = useState<boolean>(false);
	const { user } = useAuthContext();

	const handleSplitEvenly = () => {
		if (totalAmount <= 0) {
			toast.error("Total Amount must be greater than 0 to split evenly.");
			return;
		}
		const newSplitState = !isSplitEvenly;
		setIsSplitEvenly(newSplitState);

		// Use newSplitState instead of isSplitEvenly (state hasn't updated yet)
		if (newSplitState) {
			const hasAmountMembers = selectedUsers.filter(
				(user) => (user.amount ?? 0) !== 0 || (user.splitPercentage ?? 0) !== 0,
			);

			if (hasAmountMembers.length !== 0) {
				// Scenario: Some members already have amounts set
				const totalPaid = hasAmountMembers.reduce(
					(sum, member) => sum + (member.amount || 0),
					0,
				);

				const remainingAmount = totalAmount - totalPaid;
				const membersToSplit = selectedUsers.filter(
					(user) =>
						(user.amount ?? 0) === 0 && (user.splitPercentage ?? 0) === 0,
				);

				if (membersToSplit.length > 0 && remainingAmount > 0) {
					const splitAmount = remainingAmount / membersToSplit.length;
					const splitPercentage =
						((remainingAmount / totalAmount) * 100) / membersToSplit.length;

					// Round down amounts for all members
					let updatedMembers = selectedUsers.map((member) => {
						if (
							(member.amount ?? 0) === 0 &&
							(member.splitPercentage ?? 0) === 0
						) {
							return {
								...member,
								amount: Math.floor(splitAmount * 100) / 100,
								splitPercentage: Math.floor(splitPercentage * 100) / 100,
							};
						}
						return member;
					});

					// Calculate rounding difference and add to last split member
					const calculatedTotal = updatedMembers.reduce(
						(sum, m) => sum + m.amount,
						0,
					);
					const difference =
						Math.round((totalAmount - calculatedTotal) * 100) / 100;

					if (difference !== 0) {
						const lastSplitIndex = updatedMembers.findIndex(
							(m) =>
								m.amount > 0 &&
								(m.splitPercentage ?? 0) > 0 &&
								membersToSplit.some((split) => split._id === m._id),
						);

						if (lastSplitIndex !== -1) {
							const newAmount =
								updatedMembers[lastSplitIndex].amount + difference;
							updatedMembers[lastSplitIndex] = {
								...updatedMembers[lastSplitIndex],
								amount: Math.round(newAmount * 100) / 100,
								splitPercentage:
									Math.round((newAmount / totalAmount) * 100 * 100) / 100,
							};
						}
					}

					setSelectedUsers(updatedMembers);
				}
			} else {
				// Scenario: No members have amounts set - split evenly among all
				const splitAmount = totalAmount / selectedUsers.length;
				const splitPercentage = 100 / selectedUsers.length;

				// Round down for all members
				let updatedMembers = selectedUsers.map((member) => ({
					...member,
					amount: Math.floor(splitAmount * 100) / 100,
					splitPercentage: Math.floor(splitPercentage * 100) / 100,
				}));

				// Add rounding difference to last member
				const calculatedTotal = updatedMembers.reduce(
					(sum, m) => sum + m.amount,
					0,
				);
				const difference =
					Math.round((totalAmount - calculatedTotal) * 100) / 100;

				if (difference !== 0) {
					const lastIndex = updatedMembers.length - 1;
					const newAmount = updatedMembers[lastIndex].amount + difference;
					updatedMembers[lastIndex] = {
						...updatedMembers[lastIndex],
						amount: Math.round(newAmount * 100) / 100,
						splitPercentage:
							Math.round((newAmount / totalAmount) * 100 * 100) / 100,
					};
				}

				setSelectedUsers(updatedMembers);
			}
		} else {
			// Reset all amounts when toggling off
			setSelectedUsers((prev) =>
				prev.map((member) => ({
					...member,
					amount: 0,
					splitPercentage: 0,
				})),
			);
		}
	};

	const handleSplitPercentageChange = (
		userId: string,
		splitPercentage: number,
	) => {
		const amountOfThePercentage = (splitPercentage / 100) * totalAmount;
		setSelectedUsers((prev) =>
			prev.map((row) =>
				row._id === userId
					? { ...row, amount: amountOfThePercentage, splitPercentage }
					: row,
			),
		);
	};

	const handleAmountChange = (userId: string, amount: number) => {
		const paidPercentage = (amount / totalAmount) * 100;
		setSelectedUsers((prev) =>
			prev.map((row) =>
				row._id === userId
					? { ...row, splitPercentage: paidPercentage, amount }
					: row,
			),
		);
	};

	return (
		<Card>
			<CardTitle className="flex justify-between items-center py-2 px-4">
				<div className="flex gap-2 ml-auto">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleSplitEvenly}
						type="button"
					>
						{isSplitEvenly && <CheckIcon className="h-4 w-4 mr-2" />}
						Split Evenly
					</Button>
					{user?._id === paidBy && (
						<Button
							size="sm"
							className="bg-black hover:bg-gray-800"
							type="button"
							onClick={onOpenDialog}
						>
							Add Members
						</Button>
					)}
				</div>
			</CardTitle>
			<EditableAmountTable
				data={selectedUsers}
				onSplitPercentageChange={handleSplitPercentageChange}
				onAmountChange={handleAmountChange}
				onRemoveMember={onRemoveMember}
				paidBy={paidBy ?? ""}
				expenseId={expenseId}
			/>
		</Card>
	);
};

export default MemberSelectTable;
