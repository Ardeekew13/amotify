"use client";

import {
	CREATE_EXPENSE,
	GET_EXPENSE_BY_ID,
	MARK_AS_PAID,
} from "@/app/api/graphql/expense";
import FloatingButton from "@/components/common/FloatingButton";
import AddMemberDialog from "@/components/expense/dialog/AddMemberDialog";
import MemberSelectTable from "@/components/expense/MemberTable";
import { ReceiptUpload } from "@/components/expense/ReceiptUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	CreateExpense,
	ExpenseStatus,
	GetExpenseById,
	MemberExpense,
	MemberExpenseStatus,
} from "@/interface/common/common";
import { User } from "@/interface/userInterface";
import { removeDuplicateReceipts } from "@/lib/receiptUtils";
import { useMutation, useQuery } from "@apollo/client/react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../auth/AuthProvider";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

const Page = () => {
	const params = useParams();
	const [title, setTitle] = useState("");
	const [amount, setAmount] = useState(0);
	const [description, setDescription] = useState("");
	const [receiptFile, setReceiptFile] = useState<File[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<MemberExpense[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [existingReceiptUrl, setExistingReceiptUrl] = useState<string[] | null>(
		null,
	);
	const [existingReceiptPublicId, setExistingReceiptPublicId] = useState<
		string[] | null
	>(null);
	const [expenseId, setExpenseId] = useState<string | null>(null);
	const [paidBy, setPaidBy] = useState<string | null>(null);
	const [paidByUser, setPaidByUser] = useState<User | null>(null);
	const router = useRouter();
	const { user } = useAuthContext();

	useEffect(() => {
		if (user && !paidBy) {
			setPaidBy(user._id);
			const fullUser = { ...user, createdAt: "", updatedAt: "" };
			setPaidByUser(fullUser);
		}
	}, [user, paidBy]);

	const {
		data,
		loading: dataloading,
		refetch,
	} = useQuery<GetExpenseById>(GET_EXPENSE_BY_ID, {
		variables: {
			id: params.id,
		},
		skip: !params.id,
	});

	const [createExpense, { loading: upsertLoading }] =
		useMutation<CreateExpense>(CREATE_EXPENSE);

	const [markAsPaid, { loading: paidLoading }] = useMutation(MARK_AS_PAID);

	const uploadReceipt = async (
		file: File,
	): Promise<{ url: string; publicId: string } | null> => {
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				return { url: data.url, publicId: data.publicId };
			} else {
				toast.error(data.error || "Failed to upload receipt");
				return null;
			}
		} catch (error) {
			toast.error("Failed to upload receipt");
			return null;
		}
	};

	const handleConfirmAddMembers = (newMembers: MemberExpense[]) => {
		setSelectedUsers(newMembers);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!title.trim()) {
			toast.error("Title is required");
			return;
		}

		if (amount <= 0) {
			toast.error("Amount must be greater than 0");
			return;
		}

		if (selectedUsers.length === 0) {
			toast.error("Please add at least one member");
			return;
		}

		const totalSplit = selectedUsers.reduce((sum, m) => sum + m.amount, 0);
		if (Math.abs(totalSplit - amount) > 0.01) {
			toast.error(
				`Split total ($${totalSplit.toFixed(2)}) must equal expense amount ($${amount.toFixed(2)})`,
			);
			return;
		}

		setIsUploading(true);

		let receiptUrls: string[] = existingReceiptUrl
			? [...existingReceiptUrl]
			: [];
		let receiptPublicIds: string[] = existingReceiptPublicId
			? [...existingReceiptPublicId]
			: [];

		if (receiptFile.length > 0) {
			const uploadPromises = receiptFile.map((file) => uploadReceipt(file));
			const uploadedReceipts = await Promise.all(uploadPromises);

			uploadedReceipts.forEach((receipt) => {
				if (receipt) {
					receiptUrls?.push(receipt.url);
					receiptPublicIds?.push(receipt.publicId);
				}
			});
		}

		// Remove duplicate receipts before submitting
		const { uniqueUrls, uniquePublicIds } = removeDuplicateReceipts(
			receiptUrls,
			receiptPublicIds,
		);

		const expenseData = {
			id: expenseId,
			title,
			amount,
			description,
			receiptUrl: uniqueUrls,
			receiptPublicId: uniquePublicIds,
			paidBy: paidBy ?? user!._id,
			split: selectedUsers.map((member: MemberExpense) => ({
				userId: member.user._id,
				amount: member.amount,
				splitPercentage: member.splitPercentage,
				status:
					member.user._id === (paidBy ?? user!._id)
						? MemberExpenseStatus.PAID
						: member.status,
			})),
		};

		try {
			const { data } = await createExpense({
				variables: {
					input: expenseData,
				},
			});

			if (data?.createExpense?.success) {
				toast.success(data?.createExpense?.message);
				router.push(`/expense/manage/${data.createExpense.expense?._id}`);
				// Reset form
				setTitle("");
				setAmount(0);
				setDescription("");
				setReceiptFile([]);
				setSelectedUsers([]);
				setExistingReceiptUrl(null);
				setExistingReceiptPublicId(null);
			} else {
				toast.error(data?.createExpense?.message || "Failed to create expense");
			}
		} catch (error) {
			console.error("Create expense error:", error);
			toast.dismiss("upload-progress");
			toast.dismiss("create-progress");
			toast.error("Failed to create expense");
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveMember = (userId: string) => {
		setSelectedUsers((prev) => {
			// Step 1: Remove the member
			const remainingMembers = prev.filter(
				(member) => member?.user?._id !== userId,
			);

			// Step 2: Recalculate if needed
			if (remainingMembers.length > 0 && amount > 0) {
				const splitAmount = amount / remainingMembers.length;
				const splitPercentage = 100 / remainingMembers.length;

				// Round down for all members
				const flooredAmount = Math.floor(splitAmount * 100) / 100;
				const flooredPercentage = Math.floor(splitPercentage * 100) / 100;

				const updatedMembers = remainingMembers.map((member, index) => {
					return {
						...member,
						amount: flooredAmount,
						splitPercentage: flooredPercentage,
					};
				});

				// Calculate the difference and add to last person
				const totalAssigned = flooredAmount * remainingMembers.length;
				const difference = Number((amount - totalAssigned).toFixed(2));

				if (difference > 0 && updatedMembers.length > 0) {
					const lastIndex = updatedMembers.length - 1;
					updatedMembers[lastIndex] = {
						...updatedMembers[lastIndex],
						amount: Number(
							(updatedMembers[lastIndex].amount + difference).toFixed(2),
						),
					};
				}
				return updatedMembers;
			}
			toast.success("Member removed and amounts recalculated");
			return remainingMembers;
		});
	};

	const handleConfirmMembers = (newMembers: MemberExpense[]) => {
		// Add new members with initialized amount and splitPercentage
		setSelectedUsers((prev) => {
			const existingIds = prev.map((m) => m._id);
			const uniqueNew = newMembers
				.filter((m) => !existingIds.includes(m._id))
				.map((m) => ({
					...m,
					amount: m.amount ?? 0,
					splitPercentage: m.splitPercentage ?? 0,
				}));
			return [...prev, ...uniqueNew];
		});
	};

	useEffect(() => {
		if (params.id && data) {
			const expense = data?.getExpenseById?.expense;
			setExpenseId(expense?._id ?? null);
			setTitle(expense?.title);
			setAmount(expense?.amount ?? null);
			setDescription(expense?.description || "");
			setExistingReceiptUrl(expense?.receiptUrl || null);
			setExistingReceiptPublicId(expense?.receiptPublicId || null);
			setExpenseId(expense?._id);
			setPaidBy(expense?.paidBy);
			setPaidByUser(expense?.paidByUser);

			const splitData = data.getExpenseById.expense.split.map((member) => ({
				...member,
				user: member.user,
				status:
					member.user._id === expense?.paidBy
						? MemberExpenseStatus.PAID
						: member.status,
			}));
			setSelectedUsers(splitData);
		}
	}, [data]);

	// const handleAddUser = (user: User) => {
	// 	setSelectedUsers((prev) => {
	// 		// Check if the user is already in the list
	// 		const isExisting = prev.find((u) => u.userId === user._id);
	// 		if (isExisting) {
	// 			toast.error("User is already added");
	// 			return prev;
	// 		}

	// 		return [
	// 			...prev,
	// 			{
	// 				userId: user._id,
	// 				amount: 0,
	// 				splitPercentage: 0,
	// 				user: user, // Add the user object for reference
	// 			},
	// 		];
	// 	});
	// };

	const handleMarkAsPaid = () => {
		markAsPaid({
			variables: {
				input: {
					expenseId: expenseId!,
					memberId: user!._id,
					type: "PAID",
				},
			},
		})
			.then((result) => {
				const data = result.data as any;
				if (data?.markSplitAsPaid?.success) {
					toast.success(data?.markSplitAsPaid?.message);
					refetch();
				} else {
					toast.error(
						data?.markSplitAsPaid?.message || "Failed to mark as paid",
					);
				}
			})
			.catch((error) => {
				console.error("Mark as Paid error:", error);
				toast.error("Failed to mark as paid");
			});
	};

	if (dataloading) {
		return <Skeleton />;
	}

	const expense = data?.getExpenseById?.expense;
	const isCurrentUserPaid = expense?.split?.find(
		(member) =>
			member?.user?._id === user?._id &&
			member?.status === MemberExpenseStatus.AWAITING_CONFIRMATION,
	);
	const someoneAlreadyPaid = expense?.split?.some(
		(member) =>
			member?.user?._id !== user?._id &&
			member?.status === MemberExpenseStatus.AWAITING_CONFIRMATION,
	);
	
	const isNewExpense = !expense?._id;
	const isPaidByCurrentUser = expense?.paidBy === user?._id;
	const isCompleted = expense?.status === ExpenseStatus.COMPLETED;
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{data?.getExpenseById?.expense ? "Edit Expense" : "Add Expense"}
					</h1>
					<p className="text-muted-foreground">
						Manage and track your shared expenses{" "}
						{expense && (
							<Badge>
								{expense?.status === ExpenseStatus.COMPLETED
									? "Paid"
									: "Awaiting Payment"}
							</Badge>
						)}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6 pb-24">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter expense title"
							required
						/>
					</div>

					<div className="grid w-full max-w-sm items-center gap-1.5">
						<Label htmlFor="amount">Amount</Label>
						<Input
							type="number"
							id="amount"
							placeholder="0"
							value={amount === 0 ? "" : amount}
							onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
							onFocus={(e) => e.target.select()}
						/>
					</div>
					{data?.getExpenseById?.expense && (
						<div className="space-y-2">
							<Label htmlFor="paidByUser">Paid By</Label>
							<Input
								id="paidByUser"
								value={paidByUser?.firstName + " " + paidByUser?.lastName || ""}
								placeholder="Enter who paid the expense"
							/>
						</div>
					)}
				</div>

				<div className="flex-1 min-h-0">
					<Label>Add Members</Label>
					<MemberSelectTable
						selectedUsers={selectedUsers}
						setSelectedUsers={setSelectedUsers}
						onOpenDialog={() => setIsDialogOpen(true)}
						totalAmount={amount}
						onRemoveMember={handleRemoveMember}
						paidBy={paidBy ?? ""}
						expenseId={expenseId ?? ""}
					/>
				</div>

				<div className="space-y-2">
					<Label>Attachment</Label>
					<ReceiptUpload
						value={receiptFile}
						onChange={setReceiptFile}
						existingUrl={existingReceiptUrl || null}
						multiple={true}
						maxFiles={5}
						someoneAlreadyPaid={someoneAlreadyPaid ?? false}
					/>
				</div>

				<FloatingButton>
					<div className="flex gap-4 ml-auto">
						<Button
							type="button"
							variant="outline"
							className="text-gray-700"
							disabled={upsertLoading || isUploading}
							onClick={() => router.push("/expense")}
						>
							Cancel
						</Button>
						{(isNewExpense || isPaidByCurrentUser) && !someoneAlreadyPaid && !isCompleted && (
							<Button
								type="submit"
								className="hover:bg-green-800 text-white"
								disabled={upsertLoading || isUploading}
							>
								{upsertLoading || isUploading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{isNewExpense ? "Creating" : "Updating"}
									</>
								) : isNewExpense ? (
									"Add Expense"
								) : (
									"Update Expense"
								)}
							</Button>
						)}

						{expense?._id && !isPaidByCurrentUser && !isCompleted && (
							<Button onClick={() => handleMarkAsPaid()}>
								{isCurrentUserPaid ? "Mark as Unpaid" : "Mark as Paid"}
							</Button>
						)}
					</div>
				</FloatingButton>
			</form>

			<div className="flex flex-col gap-4">
				<AddMemberDialog
					isOpen={isDialogOpen}
					onClose={() => setIsDialogOpen(false)}
					onConfirm={handleConfirmAddMembers}
					currentMembers={selectedUsers}
				/>
			</div>
		</div>
	);
};

export default Page;
