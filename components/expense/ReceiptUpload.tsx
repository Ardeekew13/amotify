"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeReceiptUrls } from "@/lib/receiptUtils";
import { cn } from "@/lib/utils";
import { Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ReceiptUploadProps {
	value: File[];
	onChange: (files: File[]) => void;
	existingUrl?: string | string[] | null; // Support both single and array
	multiple?: boolean;
	maxFiles?: number;
	someoneAlreadyPaid: boolean; // Optional prop to indicate if someone has already paid
	isOwner: boolean; //Prop to know if the user can add or delete the attachments
}

export function ReceiptUpload({
	value = [],
	onChange,
	existingUrl,
	multiple = false,
	maxFiles = 5,
	someoneAlreadyPaid,
	isOwner,
}: ReceiptUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Normalize existing URL to array with backward compatibility
	const [existingReceipts, setExistingReceipts] = useState<string[]>(
		normalizeReceiptUrls(existingUrl),
	);

	// Sync with existingUrl prop changes
	useEffect(() => {
		const normalized = normalizeReceiptUrls(existingUrl);
		// Combine existing URLs with local file previews
		const localPreviews = value.map((file) => URL.createObjectURL(file));
		setExistingReceipts([...normalized, ...localPreviews]);

		// Cleanup for local previews
		return () => {
			localPreviews.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [existingUrl, value]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const newFiles = Array.from(files).filter((file) => {
			if (!file.type.startsWith("image/")) {
				toast.error(`${file.name} is not an image file`);
				return false;
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error(`${file.name} is larger than 5MB`);
				return false;
			}
			return true;
		});

		if (newFiles.length === 0) {
			return;
		}

		const replaceIndex = fileInputRef.current?.dataset.replaceIndex;

		if (replaceIndex !== undefined) {
			// Replace a receipt
			const index = parseInt(replaceIndex);
			const isExistingUrl = existingReceipts[index]?.startsWith("http");

			if (isExistingUrl) {
				// Remove existing URL and add new file
				const updated = [...existingReceipts];
				updated.splice(index, 1);
				setExistingReceipts(updated);
			}

			// Always update the value array
			onChange(multiple ? [...value, newFiles[0]] : [newFiles[0]]);
		} else if (multiple) {
			// Add multiple files
			const combined = [...value, ...newFiles];
			const existingCount = existingReceipts.filter((url) =>
				url.startsWith("http"),
			).length;
			const remaining = maxFiles - existingCount;
			const limited = combined.slice(0, remaining);
			onChange(limited);
			if (combined.length > remaining) {
				toast.warning(
					`Only ${maxFiles} files allowed. Extra files were ignored.`,
				);
			}
		} else {
			// Replace single file
			onChange([newFiles[0]]);
		}

		// Reset input and data attributes
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
			delete fileInputRef.current.dataset.replaceIndex;
		}
	};

	const handleRemove = (index: number) => {
		const url = existingReceipts[index];
		const isExistingUrl = url?.startsWith("http");

		// Remove from display
		const updated = existingReceipts.filter((_, i) => i !== index);
		setExistingReceipts(updated);

		// If it was a local preview, also remove from value array
		if (!isExistingUrl) {
			const localPreviews = existingReceipts.filter(
				(u) => !u.startsWith("http"),
			);
			const localIndex = localPreviews.indexOf(url);
			if (localIndex !== -1) {
				const updatedValue = value.filter((_, i) => i !== localIndex);
				onChange(updatedValue);
			}

			// Clean up preview URL
			URL.revokeObjectURL(url);
		}
	};

	const handleReplace = (url: string) => {
		window.open(url, "_blank");
	};

	const handleInputClick = () => {};

	const totalReceipts = existingReceipts.length;
	const canAddMore = multiple ? totalReceipts < maxFiles : totalReceipts === 0;

	return (
		<div className="space-y-4">
			<Input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/jpg,image/png"
				multiple={multiple}
				onChange={handleFileChange}
				className="hidden"
			/>

			{/* Receipts Grid */}
			{existingReceipts.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm font-medium text-muted-foreground">
						Receipt{existingReceipts.length > 1 ? "s" : ""}
					</p>
					<div
						className={cn(
							"grid gap-3",
							multiple
								? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"
								: "grid-cols-1 max-w-lg",
						)}
					>
						{existingReceipts.map((url, index) => (
							<div
								key={`receipt-${index}`}
								className="relative group border-2 border-dashed rounded-lg overflow-hidden bg-muted/50 hover:border-primary transition-colors w-fit h-fit"
							>
								<Image
									src={url}
									alt={`Receipt ${index + 1}`}
									width={multiple ? 250 : 300}
									height={multiple ? 200 : 300}
									className="object-cover cursor-pointer hover:opacity-75 transition-opacity"
									onClick={() => handleReplace(url)}
								/>
								{!someoneAlreadyPaid && isOwner && (
									<Button
										type="button"
										variant="destructive"
										size="icon"
										className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={(e) => {
											e.stopPropagation();
											handleRemove(index);
										}}
									>
										<X className="h-3 w-3" />
									</Button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Upload Button */}
			{canAddMore && isOwner && (
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={() => {
						handleInputClick();
						fileInputRef.current?.click();
					}}
				>
					{totalReceipts === 0 ? (
						<>
							<Upload className="mr-2 h-4 w-4" />
							Upload Receipt{multiple ? "s" : ""}
						</>
					) : (
						<>
							<Plus className="mr-2 h-4 w-4" />
							Add More ({totalReceipts}/{maxFiles})
						</>
					)}
				</Button>
			)}

			{!canAddMore && multiple && (
				<p className="text-sm text-muted-foreground text-center">
					Maximum {maxFiles} receipts reached
				</p>
			)}

			<p className="text-xs text-muted-foreground">
				Accepts JPG, JPEG, PNG images (max 5MB each)
				{multiple ? ` • Maximum ${maxFiles} files` : ""}
			</p>
		</div>
	);
}
