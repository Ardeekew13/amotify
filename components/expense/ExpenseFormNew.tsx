"use client";

import { useMemo } from "react";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { useExpensePermissions } from "@/hooks/useExpensePermissions";
import { ExpenseFormHeader } from "./form/ExpenseFormHeader";
import { ExpenseFormFields } from "./form/ExpenseFormFields";
import { ExpenseFormActions } from "./form/ExpenseFormActions";
import AddMemberDialog from "@/components/expense/dialog/AddMemberDialog";
import { Skeleton } from "@/components/ui/skeleton";

const ExpenseForm = () => {
	const {
		// Form state
		formData,
		setFormData,
		selectedUsers,
		setSelectedUsers,
		isDialogOpen,
		setIsDialogOpen,
		isUploading,

		// Data & Loading
		data,
		loading: dataLoading,

		// Handlers
		handleSubmit,
		handleRemoveMember,
		handleConfirmAddMembers,
		handleMarkAsPaid,

		// Loading states
		upsertLoading,
		paidLoading,
	} = useExpenseForm();

	const permissions = useExpensePermissions(data, isUploading, upsertLoading);

	const expense = useMemo(() => data?.getExpenseById?.expense, [data]);

	if (dataLoading || upsertLoading || paidLoading) {
		return <Skeleton />;
	}

	return (
		<div className="space-y-6">
			<ExpenseFormHeader expense={expense} permissions={permissions} />

			<form onSubmit={handleSubmit} className="space-y-6 pb-24">
				<ExpenseFormFields
					formData={formData}
					setFormData={setFormData}
					selectedUsers={selectedUsers}
					setSelectedUsers={setSelectedUsers}
					onOpenDialog={() => setIsDialogOpen(true)}
					onRemoveMember={handleRemoveMember}
					permissions={permissions}
					expense={expense}
				/>

				<ExpenseFormActions
					permissions={permissions}
					isUploading={isUploading}
					upsertLoading={upsertLoading}
					onMarkAsPaid={handleMarkAsPaid}
				/>
			</form>

			<AddMemberDialog
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onConfirm={handleConfirmAddMembers}
				currentMembers={selectedUsers}
			/>
		</div>
	);
};

export default ExpenseForm;
