"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";

interface IAlertDialogProps {
	title: string;
	description?: string;
	confirmText: string;
	onConfirm: () => void;
	onClose: () => void;
	children?: React.ReactNode;
}

const AlertModal = (props: IAlertDialogProps) => {
	const {
		title,
		confirmText: confirmText,
		children,
		description,
		onConfirm,
		onClose,
	} = props;

	return (
		<>
			<AlertDialog open onOpenChange={onClose}>
				<AlertDialogContent className="max-w-2xl overflow-visible">
					<AlertDialogHeader>
						<AlertDialogTitle>{title}</AlertDialogTitle>
						{description && (
							<AlertDialogDescription>{description}</AlertDialogDescription>
						)}
					</AlertDialogHeader>
					<div className="min-h-[500px]">{children}</div>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={onConfirm}>
							{confirmText}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default AlertModal;
