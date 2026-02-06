"use client";

import { Expense, MemberExpenseStatus } from "@/interface/common/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface DashboardActionListProps {
  actionItems: Expense[];
  currentUserId: string;
}

export const DashboardActionList = ({
  actionItems,
  currentUserId,
}: DashboardActionListProps) => {
  const getActionInfo = (item: Expense) => {
    const userSplit = item.split.find(
      (split) => split.user._id === currentUserId
    );

    if (
      userSplit?.status === MemberExpenseStatus.PENDING &&
      item.paidByUser._id !== currentUserId
    ) {
      return {
        text: `You owe ${formatCurrency(userSplit.amount)} to ${
          item.paidByUser.firstName
        }`,
        action: "Mark as Paid",
        status: MemberExpenseStatus.PENDING,
      };
    }

    const awaitingConfirmation = item.split.find(
      (split) => split.status === MemberExpenseStatus.AWAITING_CONFIRMATION
    );
    if (item.paidByUser._id === currentUserId && awaitingConfirmation) {
      return {
        text: `${
          awaitingConfirmation.user.firstName
        } marked their payment of ${formatCurrency(
          awaitingConfirmation.amount
        )} as paid.`,
        action: "Confirm Payment",
        status: MemberExpenseStatus.AWAITING_CONFIRMATION,
      };
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <CardDescription>
          Expenses that need your attention for payment or confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actionItems.length > 0 ? (
            actionItems.map((item) => {
              const actionInfo = getActionInfo(item);
              if (!actionInfo) return null;

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {actionInfo.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(item.updatedAt).fromNow()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        actionInfo.status === MemberExpenseStatus.PENDING
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {actionInfo.status.replace("_", " ")}
                    </Badge>
                    <Link href={`/expense/${item._id}`}>
                      <Button size="sm">{actionInfo.action}</Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No action items for now.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
