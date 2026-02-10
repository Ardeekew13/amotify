"use client";

import { Button, Card, App } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { MemberExpense } from "@/interface/common/common";
import { useState } from "react";
import { EditableAmountTable } from "./EditableAmountTable";
import { useAuth } from "@/hooks/useAuth";
import { roundToTwoDecimals, distributePercentages } from "@/lib/helper";

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
	const { user } = useAuth();
	const { message } = App.useApp();

	const handleSplitEvenly = () => {
		if (totalAmount <= 0) {
			message.error("Total Amount must be greater than 0 to split evenly.");
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

					// Create updated members with split amounts
					let updatedMembers = selectedUsers.map((member) => {
						if (
							(member.amount ?? 0) === 0 &&
							(member.splitPercentage ?? 0) === 0
						) {
							return {
								...member,
								amount: roundToTwoDecimals(splitAmount),
								splitPercentage: 0, // Will be calculated below
							};
						}
						return member;
					});

					// Calculate proper percentages that add up to 100%
					const allAmounts = updatedMembers.map(m => m.amount);
					const properPercentages = distributePercentages(allAmounts, totalAmount);
					
					// Apply the calculated percentages
					updatedMembers = updatedMembers.map((member, index) => ({
						...member,
						splitPercentage: properPercentages[index]
					}));

					setSelectedUsers(updatedMembers);
				}
			} else {
				// Scenario: No members have amounts set - split evenly among all
				const splitAmount = totalAmount / selectedUsers.length;

				// Create updated members with split amounts
				let updatedMembers = selectedUsers.map((member) => ({
					...member,
					amount: roundToTwoDecimals(splitAmount),
					splitPercentage: 0, // Will be calculated below
				}));

				// Calculate proper percentages that add up to 100%
				const allAmounts = updatedMembers.map(m => m.amount);
				const properPercentages = distributePercentages(allAmounts, totalAmount);
				
				// Apply the calculated percentages
				updatedMembers = updatedMembers.map((member, index) => ({
					...member,
					splitPercentage: properPercentages[index]
				}));

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
				row.user._id === userId
					? { ...row, amount: amountOfThePercentage, splitPercentage }
					: row,
			),
		);
	};

	const handleAmountChange = (userId: string, amount: number) => {
		const paidPercentage = roundToTwoDecimals((amount / totalAmount) * 100);
		setSelectedUsers((prev) =>
			prev.map((row) =>
				row.user._id === userId
					? { ...row, splitPercentage: paidPercentage, amount }
					: row,
			),
		);
	};

	return (
		<Card 
			extra={
				<div style={{ display: 'flex', gap: 8 }}>
					<Button
						type={isSplitEvenly ? "primary" : "default"}
						size="middle"
						onClick={handleSplitEvenly}
						icon={isSplitEvenly ? <CheckOutlined /> : null}
					>
						Split Evenly
					</Button>
					{user?._id === paidBy && (
						<Button
							type="primary"
							size="middle"
							onClick={onOpenDialog}
							style={{ backgroundColor: '#000000' }}
						>
							Add Members
						</Button>
					)}
				</div>
			}
		>
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
