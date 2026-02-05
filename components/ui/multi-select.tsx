"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

export type Option = {
	label: string;
	value: string;
};

export type SelectedItem = string | { label: string; value: string };

interface MultiSelectProps {
	options: Option[];
	selected: SelectedItem[];
	onChange: (selected: SelectedItem[]) => void;
	placeholder?: string;
	className?: string;
	labelInValue?: boolean;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Select items...",
	className,
	labelInValue = false,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");

	// Get value from selected item (handles both string and object)
	const getValue = (item: SelectedItem): string => {
		return typeof item === "string" ? item : item.value;
	};

	// Get all selected values as strings for comparison
	const selectedValues = selected.map(getValue);

	const handleUnselect = (value: string) => {
		onChange(selected.filter((i) => getValue(i) !== value));
	};

	const handleSelect = (value: string) => {
		const option = options.find((opt) => opt.value === value);
		if (!option) return;

		if (selectedValues.includes(value)) {
			onChange(selected.filter((i) => getValue(i) !== value));
		} else {
			const newItem = labelInValue ? { label: option.label, value: option.value } : value;
			onChange([...selected, newItem] as SelectedItem[]);
		}
	};

	const selectedOptions = options.filter((option) =>
		selectedValues.includes(option.value)
	);

	return (
		<Command className={className}>
			<div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
				<div className="flex flex-wrap gap-1">
					{selectedOptions.map((option) => (
						<Badge key={option.value} variant="secondary">
							{option.label}
							<button
								className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleUnselect(option.value);
									}
								}}
								onMouseDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
								onClick={() => handleUnselect(option.value)}
							>
								<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
							</button>
						</Badge>
					))}
					<CommandPrimitive.Input
						value={inputValue}
						onValueChange={setInputValue}
						onBlur={() => setOpen(false)}
						onFocus={() => setOpen(true)}
						placeholder={selected.length === 0 ? placeholder : ""}
						className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
					/>
				</div>
			</div>
			<div className="relative mt-2">
				{open && options.length > 0 ? (
					<div className="absolute top-0 left-0 right-0 z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
						<CommandGroup className="h-full overflow-auto max-h-64">
							{options
								.filter((option) =>
									option.label.toLowerCase().includes(inputValue.toLowerCase())
								)
								.map((option) => (
									<CommandItem
										key={option.value}
										onMouseDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onSelect={() => handleSelect(option.value)}
										className="cursor-pointer"
									>
										<div
											className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
												selectedValues.includes(option.value)
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible"
											}`}
										>
											<svg
												className="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<span>{option.label}</span>
									</CommandItem>
								))}
						</CommandGroup>
					</div>
				) : null}
			</div>
		</Command>
	);
}
