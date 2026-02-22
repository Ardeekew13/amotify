import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import {
	CREATE_EXPENSE,
	GET_EXPENSE_BY_ID,
	MARK_AS_PAID,
} from "@/app/api/graphql/expense";
import {
	CreateExpense,
	GetExpenseById,
	MemberExpense,
	MemberExpenseStatus,
} from "@/interface/common/common";
import { User } from "@/interface/userInterface";
import { removeDuplicateReceipts } from "@/lib/receiptUtils";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { message } from "antd";

export interface FormData {
	title: string;
	amount: number;
	description: string;
	receiptFile: File[];
	existingReceiptUrl: string[] | null;
	existingReceiptPublicId: string[] | null;
	expenseId: string | null;
	paidBy: string | null;
	paidByUser: User | null;
}

export const useExpenseForm = () => {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuthContext();

	// Form state
	const [formData, setFormDataState] = useState<FormData>({
		title: "",
		amount: 0,
		description: "",
		receiptFile: [],
		existingReceiptUrl: null,
		existingReceiptPublicId: null,
		expenseId: null,
		paidBy: null,
		paidByUser: null,
	});

	const [selectedUsers, setSelectedUsers] = useState<MemberExpense[]>(
		[],
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Wrapper for form data updates
	const setFormData = useCallback((updates: Partial<FormData>) => {
		setFormDataState((prev) => ({ ...prev, ...updates }));
	}, []);

	// Initialize paid by user
	useEffect(() => {
		if (user && !formData.paidBy) {
			setFormData({
				paidBy: user._id,
				paidByUser: { ...user, createdAt: "", updatedAt: "" },
			});
		}
	}, [user, formData.paidBy, setFormData]);

	// GraphQL queries and mutations
	const { data, loading, refetch } = useQuery<GetExpenseById>(
		GET_EXPENSE_BY_ID,
		{
			variables: { id: params.id },
			skip: !params.id,
		},
	);

	const [createExpense, { loading: upsertLoading }] =
		useMutation<CreateExpense>(CREATE_EXPENSE);
	const [markAsPaid, { loading: paidLoading }] = useMutation(MARK_AS_PAID);

	// Populate form when editing existing expense
	useEffect(() => {
		if (params.id && data) {
			const expense = data?.getExpenseById?.expense;
			if (expense) {
				setFormData({
					expenseId: expense._id,
					title: expense.title || "",
					amount: expense.amount || 0,
					description: expense.description || "",
					existingReceiptUrl: expense.receiptUrl || null,
					existingReceiptPublicId: expense.receiptPublicId || null,
					paidBy: expense.paidBy || null,
					paidByUser: expense.paidByUser || null,
				});

				const splitData = expense.split.map((member) => ({
					...member,
					user: member.user,
					status:
						member.user._id === expense.paidBy
							? MemberExpenseStatus.PAID
							: member.status,
				}));
				setSelectedUsers(splitData);
			}
		}
	}, [data, params.id, setFormData]);

	// Upload receipt helper
	const uploadReceipt = async (
		file: File,
	): Promise<{ url: string; publicId: string } | null> => {
		try {
			const formDataUpload = new FormData();
			formDataUpload.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formDataUpload,
			});

			const result = await response.json();

			if (result.success) {
				return { url: result.url, publicId: result.publicId };
			} else {
				message.error(result.error || "Failed to upload receipt");
				return null;
			}
		} catch (error) {
			message.error("Failed to upload receipt");
			return null;
		}
	};

	// Form validation
	const validateForm = () => {
		if (!formData.title.trim()) {
			message.error("Title is required");
			return false;
		}

		if (formData.amount <= 0) {
			message.error("Amount must be greater than 0");
			return false;
		}

		if (selectedUsers.length === 0) {
			message.error("Please add at least one member");
			return false;
		}

		const totalSplit = selectedUsers.reduce((sum, m) => sum + m.amount, 0);
		if (Math.abs(totalSplit - formData.amount) > 0.01) {
			message.error(
				`Split total ($${totalSplit.toFixed(2)}) must equal expense amount ($${formData.amount.toFixed(2)})`,
			);
			return false;
		}

		return true;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsUploading(true);

		try {
			let receiptUrls: string[] = formData.existingReceiptUrl
				? [...formData.existingReceiptUrl]
				: [];
			let receiptPublicIds: string[] = formData.existingReceiptPublicId
				? [...formData.existingReceiptPublicId]
				: [];

			// Upload new receipts
			if (formData.receiptFile.length > 0) {
				const uploadPromises = formData.receiptFile.map((file) =>
					uploadReceipt(file),
				);
				const uploadedReceipts = await Promise.all(uploadPromises);

				uploadedReceipts.forEach((receipt) => {
					if (receipt) {
						receiptUrls.push(receipt.url);
						receiptPublicIds.push(receipt.publicId);
					}
				});
			}

			// Remove duplicate receipts
			const { uniqueUrls, uniquePublicIds } = removeDuplicateReceipts(
				receiptUrls,
				receiptPublicIds,
			);

			const expenseData = {
				id: formData.expenseId,
				title: formData.title,
				amount: formData.amount,
				description: formData.description,
				receiptUrl: uniqueUrls,
				receiptPublicId: uniquePublicIds,
				paidBy: formData.paidBy ?? user!._id,
				split: selectedUsers.map((member: MemberExpense) => ({
					userId: member.user._id,
					amount: member.amount,
					splitPercentage: member.splitPercentage,
					status:
						member.user._id === (formData.paidBy ?? user!._id)
							? MemberExpenseStatus.PAID
							: member.status,
				})),
			};

			const { data: result } = await createExpense({
				variables: { input: expenseData },
			});

			if (result?.createExpense?.success) {
				message.success(result.createExpense.message);
				router.push(`/expense/manage/${result.createExpense.expense?._id}`);
				setFormData({
					existingReceiptUrl: [],
					existingReceiptPublicId: [],
				});
				return;
			} else {
				message.error(
					result?.createExpense?.message || "Failed to create expense",
				);
			}
		} catch (error) {
			console.error("Create expense error:", error);
			message.error("Failed to create expense");
		} finally {
			setIsUploading(false);
		}
	};

	// Member management
	const handleRemoveMember = (userId: string) => {
		setSelectedUsers((prev) => {
			const remainingMembers = prev.filter(
				(member) => member?.user?._id !== userId,
			);

			if (remainingMembers.length > 0 && formData.amount > 0) {
				const splitAmount = formData.amount / remainingMembers.length;
				const splitPercentage = 100 / remainingMembers.length;

				const flooredAmount = Math.floor(splitAmount * 100) / 100;
				const flooredPercentage = Math.floor(splitPercentage * 100) / 100;

				const updatedMembers = remainingMembers.map((member) => ({
					...member,
					amount: flooredAmount,
					splitPercentage: flooredPercentage,
				}));

				// Add remainder to last member
				const totalAssigned = flooredAmount * remainingMembers.length;
				const difference = Number((formData.amount - totalAssigned).toFixed(2));

				if (difference > 0 && updatedMembers.length > 0) {
					const lastIndex = updatedMembers.length - 1;
					updatedMembers[lastIndex] = {
						...updatedMembers[lastIndex],
						amount: Number(
							(updatedMembers[lastIndex].amount + difference).toFixed(2),
						),
					};
				}

				message.success("Member removed and amounts recalculated");
				return updatedMembers;
			}

			message.success("Member removed");
			return remainingMembers;
		});
	};

	const handleConfirmAddMembers = (newMembers: MemberExpense[]) => {
		setSelectedUsers(newMembers);
	};

	// Mark as paid
	const handleMarkAsPaid = async () => {
		try {
			const result = await markAsPaid({
				variables: {
					input: {
						expenseId: formData.expenseId!,
						memberId: user!._id,
						type: "PAID",
					},
				},
			});

			const data = result.data as any;
			if (data?.markSplitAsPaid?.success) {
				message.success(data.markSplitAsPaid.message);
				refetch();
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

	return {
		// Form state
		formData,
		setFormData,
		selectedUsers,
		setSelectedUsers,
		isDialogOpen,
		setIsDialogOpen,
		isUploading,

		// Data & loading
		data,
		loading,

		// Handlers
		handleSubmit,
		handleRemoveMember,
		handleConfirmAddMembers,
		handleMarkAsPaid,

		// Loading states
		upsertLoading,
		paidLoading,
	};
};
