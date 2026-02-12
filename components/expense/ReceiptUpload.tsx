"use client";

import { Button, Typography, App } from "antd";
import { normalizeReceiptUrls } from "@/lib/receiptUtils";
import { cn } from "@/lib/utils";
import { Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Expense } from "@/interface/common/common";
import { useAuthContext } from "../auth/AuthProvider";

const { Text } = Typography;

interface ReceiptUploadProps {
	value: File[];
	onChange: (files: File[]) => void;
	existingUrl?: string | string[] | null; // Support both single and array
	multiple?: boolean;
	maxFiles?: number;
	someoneAlreadyPaid: boolean; // Optional prop to indicate if someone has already paid
	record: Expense | null; //Prop to know if the user can add or delete the attachments
}

export function ReceiptUpload({
	value = [],
	onChange,
	existingUrl,
	multiple = false,
	maxFiles = 5,
	someoneAlreadyPaid,
	record,
}: ReceiptUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { message } = App.useApp();
	const { user } = useAuthContext();
	const isOwner = record ? record?.paidBy === user?._id : true;

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
				message.error(`${file.name} is not an image file`);
				return false;
			}
			if (file.size > 5 * 1024 * 1024) {
				message.error(`${file.name} is larger than 5MB`);
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
				message.warning(
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

	const totalReceipts = existingReceipts.length;
	const canAddMore = multiple ? totalReceipts < maxFiles : totalReceipts === 0;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/jpg,image/png"
				multiple={multiple}
				onChange={handleFileChange}
				style={{ display: "none" }}
			/>

			{/* Receipts Grid */}
			{existingReceipts.length > 0 && (
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
						Receipt{existingReceipts.length > 1 ? "s" : ""}
					</Text>
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
										type="primary"
										danger
										size="small"
										icon={<X className="h-3 w-3" />}
										style={{
											position: "absolute",
											top: 4,
											right: 4,
											height: 24,
											width: 24,
											padding: 0,
											opacity: 0,
											transition: "opacity 0.2s",
										}}
										className="group-hover:opacity-100"
										onClick={(e) => {
											e.stopPropagation();
											handleRemove(index);
										}}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Upload Button */}
			{isOwner && (
				<Button
					block
					onClick={() => {
						fileInputRef.current?.click();
					}}
					disabled={!canAddMore || someoneAlreadyPaid}
					icon={
						totalReceipts === 0 ? (
							<Upload className="h-4 w-4" />
						) : (
							<Plus className="h-4 w-4" />
						)
					}
				>
					{totalReceipts === 0
						? `Upload Receipt${multiple ? "s" : ""}`
						: `Add More (${totalReceipts}/${maxFiles})`}
				</Button>
			)}

			{!canAddMore && multiple && (
				<Text type="secondary" style={{ fontSize: 14, textAlign: "center" }}>
					Maximum {maxFiles} receipts reached
				</Text>
			)}

			<Text type="secondary" style={{ fontSize: 12 }}>
				Accepts JPG, JPEG, PNG images (max 5MB each)
				{multiple ? ` • Maximum ${maxFiles} files` : ""}
			</Text>
		</div>
	);
}
