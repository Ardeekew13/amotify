"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	OnChangeFn,
	RowSelectionState,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	meta?: Record<string, any>;
	onRowSelectionChange?: OnChangeFn<RowSelectionState>;
	rowSelection?: RowSelectionState;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	meta,
	onRowSelectionChange,
	rowSelection,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		meta,
		onRowSelectionChange,
		state: {
			rowSelection,
		},
		enableRowSelection: true,
	});

	return (
		<div className="overflow-hidden rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead 
										key={header.id}
										style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={rowSelection !== undefined && row.getIsSelected() ? "selected" : undefined}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell 
										key={cell.id}
										style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
				<TableFooter>
					{table.getFooterGroups().map((footerGroup) => (
						<TableRow key={footerGroup.id}>
							{footerGroup.headers.map((header) => (
								<TableHead 
									key={header.id} 
									className="font-bold"
									style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.footer,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableFooter>
			</Table>
		</div>
	);
}
