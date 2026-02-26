"use client";

import { MARK_AS_PAID } from "@/app/api/graphql/expense";
import { useAuth } from "@/hooks/useAuth";
import { FormData } from "@/hooks/useExpenseForm";
import { MemberExpense, MemberExpenseStatus } from "@/interface/common/common";
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
import { XIcon } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "../auth/AuthProvider";
import AddMoreItems from "./dialog/AddMoreItems";
import ShowQRCode from "./dialog/ShowQRCode";

interface IProps {
	selectedUsers: MemberExpense[];
	setSelectedUsers: React.Dispatch<React.SetStateAction<MemberExpense[]>>;
	onOpenDialog: () => void;
	totalAmount?: number;
	onRemoveMember: (userId: string) => void;
	paidBy?: string;
	expenseId: string;
	refetch?: () => void;
	formData: FormData;
	setFormData: (updates: Partial<FormData>) => void;
}

const MemberSelectTable = ({
	selectedUsers,
	setSelectedUsers,
	onOpenDialog,
	totalAmount = 0,
	onRemoveMember,
	paidBy,
	expenseId,
	refetch,
	formData,
	setFormData,
}: IProps) => {
	const [isSplitEvenly, setIsSplitEvenly] = useState<boolean>(false);
	const { user } = useAuth();
	const { message } = App.useApp();
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [type, setType] = useState<string>("");

	const [markAsPaid, { loading: paidLoading }] = useMutation(MARK_AS_PAID);

	const handleMarkAsPaid = async (memberId: string) => {
		try {
			const result = await markAsPaid({
				variables: {
					input: {
						expenseId,
						memberId: memberId,
						type: "PAID",
					},
				},
			});

			const data = result.data as any;
			if (data?.markSplitAsPaid?.success) {
				message.success(data.markSplitAsPaid.message);
				refetch?.();
			} else {
				message.error(
					data?.markSplitAsPaid?.message || "Failed to mark as paid",
				);
			}
		} catch (error) {
			console.error("Mark as Paid error:", error);
			message.error("Failed to mark as paid");
		}
	};

	const handleSplitEvenly = () => {
		if (totalAmount <= 0) {
			message.error("Total Amount must be greater than 0 to split evenly.");
			return;
		}
		const newSplitState = !isSplitEvenly;
		setIsSplitEvenly(newSplitState);

		// Use newSplitState instead of isSplitEvenly (state hasn't updated yet)
		if (newSplitState) {
			// Calculate total addOns and deductions across all members
			const totalAddOns = selectedUsers.reduce((sum, member) => {
				return sum + (member.addOns?.reduce((total, addon) => total + addon, 0) || 0);
			}, 0);

			const totalDeductions = selectedUsers.reduce((sum, member) => {
				return sum + (member.deductions?.reduce((total, deduction) => total + deduction, 0) || 0);
			}, 0);

			// Calculate the remaining amount to split after accounting for addOns and deductions
			const amountToSplit = totalAmount - totalAddOns + totalDeductions;
			
			// Split evenly among ALL members
			const splitAmount = amountToSplit / selectedUsers.length;
			const roundedAmount = roundToTwoDecimals(splitAmount);

			// Helper to calculate balance including addOns/deductions
			const getMemberBalance = (member: MemberExpense) => {
				const addOns = member.addOns?.reduce((sum, val) => sum + val, 0) || 0;
				const deductions = member.deductions?.reduce((sum, val) => sum + val, 0) || 0;
				return (member.amount || 0) + addOns - deductions;
			};

			// Create updated members with split amounts and calculated balance
			let updatedMembers = selectedUsers.map((member) => {
				const addOns = member.addOns?.reduce((sum, val) => sum + val, 0) || 0;
				const deductions = member.deductions?.reduce((sum, val) => sum + val, 0) || 0;
				const calculatedBalance = roundToTwoDecimals(roundedAmount + addOns - deductions);
				
				return {
					...member,
					amount: roundedAmount,
					balance: calculatedBalance,
					splitPercentage: 0, // Will be calculated below
				};
			});

			// Calculate the total balance after rounding
			const totalAfterRounding = updatedMembers.reduce(
				(sum, member) => sum + (member.balance || 0),
				0,
			);

			// Add the rounding difference to the paidBy user (owner)
			const difference = roundToTwoDecimals(totalAmount - totalAfterRounding);
			if (difference !== 0 && updatedMembers.length > 0) {
				// Find the index of the user who paid (paidBy)
				const paidByIndex = updatedMembers.findIndex(
					(member) => member.user._id === paidBy,
				);

				// If paidBy user is in the list, add difference to them, otherwise use last member
				const targetIndex =
					paidByIndex !== -1 ? paidByIndex : updatedMembers.length - 1;

				updatedMembers[targetIndex].amount = roundToTwoDecimals(
					updatedMembers[targetIndex].amount + difference,
				);
				
				// Recalculate balance for the member with the rounding difference
				const addOns = updatedMembers[targetIndex].addOns?.reduce((sum, val) => sum + val, 0) || 0;
				const deductions = updatedMembers[targetIndex].deductions?.reduce((sum, val) => sum + val, 0) || 0;
				updatedMembers[targetIndex].balance = roundToTwoDecimals(
					updatedMembers[targetIndex].amount + addOns - deductions,
				);
			}

			// Calculate proper percentages that add up to 100%
			const allBalances = updatedMembers.map((m) => m.balance || 0);
			const properPercentages = distributePercentages(
				allBalances,
				totalAmount,
			);

			// Apply the calculated percentages
			updatedMembers = updatedMembers.map((member, index) => ({
				...member,
				splitPercentage: properPercentages[index],
			}));

			setSelectedUsers(updatedMembers);
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

		setSelectedUsers((prev) =>
			prev.map((row) =>
				row.user._id === userId
					? { ...row, splitPercentage: paidPercentage, amount }
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

	const handleOpenAdd = (userId: string, itemType: string) => {
		setSelectedUserId(userId);
		setType(itemType);
		setIsOpenModal(true);
	};

	const handleAddItems = (amountInputted: number) => {
		if (!selectedUserId) return;
		if (type === "DEDUCTION" && amountInputted <= 0) {
			message.error("Deduction amount must be greater than 0.");
			return;
		}
		if (totalAmount <= 0) {
			message.error("Total amount must be greater than 0 to add items.");
			setIsOpenModal(false);
			setSelectedUserId(null);
			return;
		}

		// Validate BEFORE updating state
		if (type === "DEDUCTION") {
			const selectedMember = selectedUsers.find(
				(m) => m.user._id === selectedUserId,
			);
			if (
				!selectedMember ||
				selectedMember.amount === undefined ||
				selectedMember.amount === null ||
				selectedMember.amount <= 0
			) {
				message.error(
					"Cannot add deduction to a member with no assigned amount.",
				);
				setIsOpenModal(false);
				setSelectedUserId(null);
				setType("");
				return;
			}
		}

		setSelectedUsers((prev) =>
			prev.map((member): MemberExpense => {
				if (member.user._id === selectedUserId) {
					if (type === "ADD_ON") {
						// Don't change amount, just add to addOns array
						return {
							...member,
							addOns: Array.isArray(member.addOns)
								? [...member.addOns, amountInputted]
								: [amountInputted],
						};
					} else if (type === "DEDUCTION") {
						// Don't change amount, just add to deductions array
						return {
							...member,
							deductions: Array.isArray(member.deductions)
								? [...member.deductions, amountInputted]
								: [amountInputted],
						};
					}
				}
				return member;
			}),
		);

		// Don't modify formData.amount anymore - it should remain the total expense amount
		setSelectedUserId(null);
		setIsOpenModal(false);
		setType(""); // Reset type when done
		message.success(
			type === "ADD_ON"
				? "Add-on amount added successfully"
				: "Deduction added successfully",
		);
	};

	const isPaidByCurrentUser = paidBy === currentUser?._id;

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
			width: 160,
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
				</Flex>
			),
		},
		{
			title: <div style={{ textAlign: "center" }}>Add Ons</div>,
			key: "addOns",
			width: 160,
			align: "center",
			render: (_, record) => {
				const totalAddOns =
					record?.addOns?.reduce((sum, amount) => sum + amount, 0) || 0;
				return (
					<Flex
						align="center"
						justify="space-between"
						gap={8}
						style={{ width: "100%" }}
					>
						{totalAddOns > 0 ? (
							<>
								<Typography.Text
									style={{ fontWeight: 500, flex: 1, textAlign: "right" }}
								>
									{formatCurrency(totalAddOns || 0)}
								</Typography.Text>
								<Button
									type="text"
									size="small"
									onClick={() => handleOpenAdd(record?.user._id, "ADD_ON")}
									icon={
										<PlusCircleFilled
											style={{ fontSize: 18, color: "green" }}
										/>
									}
									style={{ padding: 0, minWidth: 32, height: 32 }}
								/>
							</>
						) : (
							<>
								<Typography.Text
									style={{
										fontWeight: 500,
										flex: 1,
										textAlign: "right",
										color: "#999",
									}}
								>
									₱0.00
								</Typography.Text>
								<Button
									type="text"
									size="small"
									key="add_on"
									onClick={() => handleOpenAdd(record?.user._id, "ADD_ON")}
									icon={
										<PlusCircleFilled
											style={{ fontSize: 18, color: "green" }}
										/>
									}
									style={{ padding: 0, minWidth: 32, height: 32 }}
								/>
							</>
						)}
					</Flex>
				);
			},
		},
		{
			title: <div style={{ textAlign: "center" }}>Deductions</div>,
			key: "deductions",
			width: 160,
			align: "center",
			render: (_, record) => {
				const totalDeductions =
					record?.deductions?.reduce((sum, amount) => sum + amount, 0) || 0;
				return (
					<Flex
						align="center"
						justify="space-between"
						gap={8}
						style={{ width: "100%" }}
					>
						{totalDeductions > 0 ? (
							<>
								<Typography.Text
									style={{ fontWeight: 500, flex: 1, textAlign: "right" }}
								>
									{formatCurrency(totalDeductions || 0)}
								</Typography.Text>
								<Button
									type="text"
									size="small"
									key="deduction"
									onClick={() => handleOpenAdd(record?.user._id, "DEDUCTION")}
									icon={
										<PlusCircleFilled
											style={{ fontSize: 18, color: "green" }}
										/>
									}
									style={{ padding: 0, minWidth: 32, height: 32 }}
								/>
							</>
						) : (
							<>
								<Typography.Text
									style={{
										fontWeight: 500,
										flex: 1,
										textAlign: "right",
										color: "#999",
									}}
								>
									₱0.00
								</Typography.Text>
								<Button
									type="text"
									size="small"
									onClick={() => handleOpenAdd(record?.user._id, "DEDUCTION")}
									icon={
										<PlusCircleFilled
											style={{ fontSize: 18, color: "green" }}
										/>
									}
									style={{ padding: 0, minWidth: 32, height: 32 }}
								/>
							</>
						)}
					</Flex>
				);
			},
		},
		{
			title: <div style={{ textAlign: "center" }}>Balance</div>,
			key: "balance",
			width: 160,
			align: "center",
			render: (_, record) => {
				record.amount = record.amount || 0;
				const totalAddOns =
					record?.addOns?.reduce((sum, amount) => sum + amount, 0) || 0;
				const totalDeductions =
					record?.deductions?.reduce((sum, amount) => sum + amount, 0) || 0;
				// Use stored balance if available, otherwise calculate
				const balance = record.balance ?? (record.amount + totalAddOns - totalDeductions);
				return (
					<Typography.Text style={{ fontWeight: 500 }}>
						{formatCurrency(balance)}
					</Typography.Text>
				);
			},
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
		{
			title: <div style={{ textAlign: "center" }}>Actions</div>,
			key: "actions",
			align: "center",
			width: 120,
			render: (_, record) => {
				if (!isPaidByCurrentUser) {
					return null;
				}

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
						{paidBy === currentUser?._id &&
							record.status != MemberExpenseStatus.AWAITING_CONFIRMATION &&
							record.status != MemberExpenseStatus.PAID && (
								<Button
									type="default"
									size="small"
									onClick={(e) => {
										e.stopPropagation();
										handleMarkAsPaid(record?.user?._id || "");
									}}
								>
									Mark As Paid
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
		},
	];

	const totalSplit = selectedUsers.reduce(
		(sum, item) => sum + (item.splitPercentage || 0),
		0,
	);

	// Calculate total balance (amount + addOns - deductions)
	const totalBalance = selectedUsers.reduce((sum, item) => {
		// Use stored balance if available, otherwise calculate
		if (item.balance !== undefined && item.balance !== null) {
			return sum + item.balance;
		}
		const amount = item.amount || 0;
		const addOns = item.addOns?.reduce((total, addon) => total + addon, 0) || 0;
		const deductions =
			item.deductions?.reduce((total, deduction) => total + deduction, 0) || 0;
		const balance = amount + addOns - deductions;
		return sum + balance;
	}, 0);

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
				loading={paidLoading || loading}
				expandable={{
					expandedRowRender: (record) => {
						if (!Array.isArray(record.addOns) || record.addOns.length === 0) {
							return <p style={{ margin: 0 }}>No add-ons</p>;
						}

						const handleRemoveAddOn = (addOnIndex: number) => {
							setSelectedUsers((prev) =>
								prev.map((member): MemberExpense => {
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

						return (
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
						<Table.Summary.Cell index={2} colSpan={4}>
							<div style={{ textAlign: "right", fontWeight: "bold" }}>
								Balance Total: {formatCurrency(totalBalance || 0)}
							</div>
						</Table.Summary.Cell>
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
					type={type}
				/>
			)}
		</Card>
	);
};

export default MemberSelectTable;
