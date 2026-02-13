"use client";

import { MARK_AS_PAID } from "@/app/api/graphql/expense";
import { useAuth } from "@/hooks/useAuth";
import { UpdatedMemberExpense } from "@/hooks/useExpenseForm";
import { MemberExpenseStatus } from "@/interface/common/common";
import {
	distributePercentages,
	formatCurrency,
	formatPercentage,
	roundToTwoDecimals,
} from "@/lib/helper";
import { CheckOutlined, PlusCircleFilled } from "@ant-design/icons";
import { useMutation } from "@apollo/client/react";
import type { TableColumnsType } from "antd";
import {
	App,
	Button,
	Card,
	Flex,
	InputNumber,
	List,
	Table,
	Tag,
	Typography,
} from "antd";
import { useState } from "react";
import { useAuthContext } from "../auth/AuthProvider";
import AddMoreItems from "./dialog/AddMoreItems";
import { MessageCircleX, XIcon } from "lucide-react";

interface IProps {
	selectedUsers: UpdatedMemberExpense[];
	setSelectedUsers: React.Dispatch<
		React.SetStateAction<UpdatedMemberExpense[]>
	>;
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
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	const handleSplitEvenly = () => {
		if (totalAmount <= 0) {
			message.error("Total Amount must be greater than 0 to split evenly.");
			return;
		}
		const newSplitState = !isSplitEvenly;
		setIsSplitEvenly(newSplitState);

		// Use newSplitState instead of isSplitEvenly (state hasn't updated yet)
		if (newSplitState) {
			// Find members who already have manually set amounts (non-zero and not from previous split)
			const hasAmountMembers = selectedUsers.filter(
				(member) => (member.amount ?? 0) > 0
			);

			if (hasAmountMembers.length > 0 && hasAmountMembers.length < selectedUsers.length) {
				// Scenario: Some members already have amounts set
				const totalPaid = hasAmountMembers.reduce(
					(sum, member) => sum + (member.amount || 0),
					0,
				);

				const remainingAmount = totalAmount - totalPaid;
				const membersToSplit = selectedUsers.filter(
					(member) => (member.amount ?? 0) === 0
				);

				if (membersToSplit.length > 0 && remainingAmount > 0) {
					const splitAmount = remainingAmount / membersToSplit.length;
					const roundedAmount = roundToTwoDecimals(splitAmount);

					// Create updated members with split amounts
					let updatedMembers = selectedUsers.map((member) => {
						if ((member.amount ?? 0) === 0) {
							return {
								...member,
								amount: roundedAmount,
								splitPercentage: 0, // Will be calculated below
							};
						}
						return member;
					});

					// Calculate the total after rounding
					const totalAfterRounding = updatedMembers.reduce(
						(sum, member) => sum + (member.amount || 0),
						0
					);

					// Distribute the rounding difference to the last member
					const difference = roundToTwoDecimals(totalAmount - totalAfterRounding);
					if (difference !== 0) {
						// Find the last member who was assigned the split amount
						const lastSplitMemberIndex = updatedMembers.reduce((lastIndex, member, index) => {
							return (member.amount === roundedAmount && (hasAmountMembers.findIndex(m => m.user._id === member.user._id) === -1)) ? index : lastIndex;
						}, -1);

						if (lastSplitMemberIndex !== -1) {
							updatedMembers[lastSplitMemberIndex].amount = roundToTwoDecimals(
								updatedMembers[lastSplitMemberIndex].amount + difference
							);
						}
					}

					// Calculate proper percentages that add up to 100%
					const allAmounts = updatedMembers.map((m) => m.amount);
					const properPercentages = distributePercentages(
						allAmounts,
						totalAmount,
					);

					// Apply the calculated percentages
					updatedMembers = updatedMembers.map((member, index) => ({
						...member,
						splitPercentage: properPercentages[index],
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
				const allAmounts = updatedMembers.map((m) => m.amount);
				const properPercentages = distributePercentages(
					allAmounts,
					totalAmount,
				);

				// Apply the calculated percentages
				updatedMembers = updatedMembers.map((member, index) => ({
					...member,
					splitPercentage: properPercentages[index],
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
		if (totalAmount <= 0) {
			message.error(
				"Total Amount must be greater than 0 to set split percentage.",
			);
			return;
		}
		const totalPercentage = selectedUsers.reduce((sum, item) => {
			// If this is the user being updated, use the new splitPercentage
			if (item.user._id === userId) {
				return sum + splitPercentage;
			}
			// Otherwise use existing splitPercentage
			return sum + (item?.splitPercentage ?? 0);
		}, 0);

		if (totalPercentage > 100) {
			message.error("Total split percentage cannot exceed 100%.");
			return;
		}
		const amountOfThePercentage = (splitPercentage / 100) * totalAmount;

		setSelectedUsers((prev) =>
			prev.map((row) =>
				row.user._id === userId
					? {
							...row,
							amount: amountOfThePercentage,
							addOns: [],
							splitPercentage,
						}
					: row,
			),
		);
	};

	const handleAmountChange = (userId: string, amount: number) => {
		if (totalAmount <= 0) {
			message.error("Total Amount must be greater than 0 to set amount.");
			return;
		}
		// Only calculate percentage if totalAmount is valid
		const paidPercentage =
			totalAmount > 0 ? roundToTwoDecimals((amount / totalAmount) * 100) : 0;
		console.log("paidPercentage", paidPercentage);
		console.log("amount", amount);
		setSelectedUsers((prev) =>
			prev.map((row) =>
				row.user._id === userId
					? { ...row, splitPercentage: paidPercentage, amount, addOns: [] }
					: row,
			),
		);
	};

	const [markReceivePayment, { loading }] = useMutation(MARK_AS_PAID);
	const { user: currentUser } = useAuthContext();

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

	const handleOpenAdd = (userId: string) => {
		setSelectedUserId(userId);
		setIsOpenModal(true);
	};

	const handleAddItems = (addOnAmount: number) => {
		console.log("addOnAmount", addOnAmount);
		if (!selectedUserId) return;

		if (totalAmount <= 0) {
			message.error("Total amount must be greater than 0 to add items.");
			setIsOpenModal(false);
			setSelectedUserId(null);
			return;
		}

		setSelectedUsers((prev) =>
			prev.map((member): UpdatedMemberExpense => {
				if (member.user._id === selectedUserId) {
					const newAmount = (member.amount || 0) + addOnAmount;
					console.log("newAmount", newAmount);

					const newPercentage =
						totalAmount > 0
							? roundToTwoDecimals((newAmount / totalAmount) * 100)
							: 0;
					return {
						...member,
						amount: newAmount,
						splitPercentage: newPercentage,
						addOns: Array.isArray(member.addOns)
							? [...member.addOns, addOnAmount]
							: [addOnAmount],
					};
				}
				return member;
			}),
		);
		setSelectedUserId(null);
		setIsOpenModal(false);
		message.success("Add-on amount added successfully");
	};

	const isPaidByCurrentUser = paidBy === currentUser?._id;

	const columns: TableColumnsType<UpdatedMemberExpense> = [
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
			render: (_, record) => {
				return (
					<InputNumber
						value={record.splitPercentage || 0}
						onChange={(value) =>
							handleSplitPercentageChange(record.user._id, value || 0)
						}
						min={0}
						max={100}
						precision={2}
						step={0.01}
						style={{ width: "100%" }}
					/>
				);
			},
		},
		{
			title: <div style={{ textAlign: "right" }}>Amount</div>,
			key: "amount",
			width: 180,
			align: "right",
			render: (_, record) => (
				<Flex>
					<InputNumber
						value={record.amount || 0}
						onChange={(value) =>
							handleAmountChange(record.user._id, value || 0)
						}
						precision={2}
						step={0.01}
						style={{ width: "100%" }}
					/>
					<Button
						type="text"
						onClick={() => handleOpenAdd(record?.user._id)}
						style={{ marginLeft: 8 }}
					>
						<PlusCircleFilled
							color="green"
							size={17}
							style={{ fontSize: 18, color: "green" }}
						/>
					</Button>
				</Flex>
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
				const isMemberRow = record.user?._id !== currentUser?._id;
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

	const totalSplit = selectedUsers.reduce(
		(sum, item) => sum + (item.splitPercentage || 0),
		0,
	);
	const totalAmountSum = selectedUsers.reduce(
		(sum, item) => sum + (item.amount || 0),
		0,
	);

	if (loading) {
		return (
			<Card title="Members">
				<div style={{ textAlign: "center", padding: 32 }}>
					Processing payment...
				</div>
			</Card>
		);
	}

	return (
		<Card
			title="Members"
			extra={
				<div style={{ display: "flex", gap: 8 }}>
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
							style={{ backgroundColor: "#000000" }}
						>
							Add Members
						</Button>
					)}
				</div>
			}
		>
			<Table
				columns={columns}
				dataSource={selectedUsers}
				rowKey={(record) => record.user._id}
				pagination={false}
				expandable={{
					expandedRowRender: (record) => {
						if (!Array.isArray(record.addOns) || record.addOns.length === 0) {
							return <p style={{ margin: 0 }}>No add-ons</p>;
						}

						const handleRemoveAddOn = (addOnIndex: number) => {
							setSelectedUsers((prev) =>
								prev.map((member): UpdatedMemberExpense => {
									if (member.user._id === record.user._id) {
										// Remove the add-on at the specified index
										const newAddOns =
											member.addOns?.filter(
												(_, index) => index !== addOnIndex,
											) || [];

										// Recalculate the amount by subtracting the removed add-on
										const removedAmount = member.addOns?.[addOnIndex] || 0;
										const newAmount = roundToTwoDecimals(
											(member.amount || 0) - removedAmount,
										);

										// Recalculate percentage
										const newPercentage =
											totalAmount > 0
												? roundToTwoDecimals((newAmount / totalAmount) * 100)
												: 0;

										return {
											...member,
											amount: newAmount,
											splitPercentage: newPercentage,
											addOns: newAddOns,
										};
									}
									return member;
								}),
							);
							message.success("Add-on removed successfully");
						};

						const totalAddOns = record.addOns.reduce(
							(sum, amount) => sum + amount,
							0,
						);

						return (
							<div>
								<List
									header={<strong>Add-ons:</strong>}
									dataSource={record.addOns}
									renderItem={(item, index) => (
										<List.Item
											actions={[
												<XIcon
													key="remove"
													color="red"
													onClick={() => handleRemoveAddOn(index)}
												/>,
											]}
										>
											<Typography.Text type="success">
												{index + 1}. {formatCurrency(item)}
											</Typography.Text>
										</List.Item>
									)}
								/>
								<div
									style={{
										marginTop: 8,
										fontWeight: "bold",
										textAlign: "right",
									}}
								>
									Total Add-ons: {formatCurrency(totalAddOns)}
								</div>
							</div>
						);
					},
				}}
				summary={() => (
					<Table.Summary.Row>
						<Table.Summary.Cell index={0} colSpan={2}>
							<strong>Total:</strong>
						</Table.Summary.Cell>
						<Table.Summary.Cell index={1}>
							<div style={{ textAlign: "right", fontWeight: "bold" }}>
								{formatPercentage(totalSplit)}
							</div>
						</Table.Summary.Cell>
						<Table.Summary.Cell index={2}>
							<div style={{ textAlign: "right", fontWeight: "bold" }}>
								{formatCurrency(totalAmountSum || 0)}
							</div>
						</Table.Summary.Cell>
						<Table.Summary.Cell index={3} />
						<Table.Summary.Cell index={4} />
					</Table.Summary.Row>
				)}
			/>
			{isOpenModal && (
				<AddMoreItems
					open={isOpenModal}
					setOpen={setIsOpenModal}
					loading={loading}
					onAddItems={handleAddItems}
					setSelectedUsers={setSelectedUsers}
					selectedUsers={selectedUsers}
				/>
			)}
		</Card>
	);
};

export default MemberSelectTable;
