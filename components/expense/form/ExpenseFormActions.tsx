import { Button } from "@/components/ui/button";
import FloatingButton from "@/components/common/FloatingButton";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExpenseFormActionsProps {
	permissions: any;
	isUploading: boolean;
	upsertLoading: boolean;
	onMarkAsPaid: () => void;
}

export const ExpenseFormActions = ({
	permissions,
	isUploading,
	upsertLoading,
	onMarkAsPaid,
}: ExpenseFormActionsProps) => {
	const router = useRouter();

	const renderSubmitButton = () => {
		if (!permissions.canEdit) return null;

		const isLoading = upsertLoading || isUploading;
		const buttonText = permissions.getSubmitButtonText();
		const loadingText = permissions.getLoadingText();

		return (
			<Button
				type="submit"
				className="hover:bg-green-800 text-white"
				disabled={isLoading}
			>
				{isLoading ? (
					<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{loadingText}
					</>
				) : (
					buttonText
				)}
			</Button>
		);
	};

	const renderMarkAsPaidButton = () => {
		if (!permissions.canMarkAsPaid) return null;

		return (
			<Button onClick={onMarkAsPaid}>
				{permissions.getMarkAsPaidText()}
			</Button>
		);
	};

	return (
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
				{renderSubmitButton()}
				{renderMarkAsPaidButton()}
			</div>
		</FloatingButton>
	);
};