"use client";

import { Expense } from "@/interface/common/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "../ui/badge";
import Link from "next/link";

interface DashboardRecentExpensesProps {
  expenses: Expense[];
}

export const DashboardRecentExpenses = ({
  expenses,
}: DashboardRecentExpensesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>
          Your 5 most recently updated expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Paid By</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>
                    <Link
                      href={`/expense/${expense._id}`}
                      className="font-medium hover:underline"
                    >
                      {expense.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {expense.paidByUser.firstName} {expense.paidByUser.lastName}
                  </TableCell>
                  <TableCell>{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>
                    {dayjs(expense.createdAt).format("MMM DD, YYYY")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        expense.status === "COMPLETED" ? "default" : "secondary"
                      }
                    >
                      {expense.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No recent expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
