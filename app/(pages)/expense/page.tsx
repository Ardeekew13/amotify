"use client";
import { GET_EXPENSES } from "@/app/api/graphql/expense";
import Loading from "@/components/common/Loading";
import ExpenseTable from "@/components/expense/ExpenseTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GetExpenses } from "@/interface/common/common";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function ExpensePage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("all");
	const [isNavigating, setIsNavigating] = useState(false);

	const { data, loading, refetch } = useQuery<GetExpenses>(GET_EXPENSES, {
		variables: { filter: activeTab === "my" ? "my" : null },
		fetchPolicy: "no-cache",
	});

	const handleAdd = useCallback(
		(id?: string) => {
			setIsNavigating(true);
			if (id) {
				router.push(`/expense/manage/${id}`);
				return;
			}
			router.push("/expense/manage");
		},
		[router],
	);

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		refetch({ filter: value === "my" ? "my" : null });
	};

	const tableProps = useMemo(() => {
		return {
			expenses: data?.getExpenses?.expenses ?? [],
			loading,
			onAdd: handleAdd,
		};
	}, [data, loading, handleAdd]);

	if (isNavigating) {
		return <Loading />;
	}
	console.log("isNavigating", isNavigating);
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
					<p className="text-muted-foreground">
						Manage and track your shared expenses
					</p>
				</div>
				<Button onClick={() => handleAdd()}>Add Expense</Button>
			</div>
			<Tabs value={activeTab} onValueChange={handleTabChange}>
				<TabsList>
					<TabsTrigger value="all">All Expenses</TabsTrigger>
					<TabsTrigger value="my">My Expenses</TabsTrigger>
				</TabsList>
				<TabsContent value="all">
					<ExpenseTable {...tableProps} />
				</TabsContent>
				<TabsContent value="my">
					<ExpenseTable {...tableProps} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
