"use client";

import { Expense, MemberExpenseStatus } from "@/interface/common/common";
import { Card, List, Tag, Button, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const { Text } = Typography;

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
        action: "Pay",
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

  const dataSource = actionItems
    .map((item) => {
      const actionInfo = getActionInfo(item);
      if (!actionInfo) return null;
      return { ...item, actionInfo };
    })
    .filter(Boolean) as Array<Expense & { actionInfo: NonNullable<ReturnType<typeof getActionInfo>> }>;

  return (
    <Card
      title="Action Items"
      extra={
        <Text type="secondary" style={{ fontSize: 14 }}>
          Expenses that need your attention for payment or confirmation.
        </Text>
      }
    >
      <List
        dataSource={dataSource}
        locale={{ emptyText: "No action items for now." }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Tag
                key="status"
                color={
                  item.actionInfo.status === MemberExpenseStatus.PENDING
                    ? "gold"
                    : "default"
                }
              >
                {item.actionInfo.status.replace("_", " ")}
              </Tag>,
              <Link key="action" href={`/expense/manage/${item._id}`}>
                <Button size="small">{item.actionInfo.action}</Button>
              </Link>,
            ]}
          >
            <List.Item.Meta
              title={<span style={{ fontWeight: 600 }}>{item.title}</span>}
              description={
                <>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    {item.actionInfo.text}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    {dayjs(item.updatedAt).fromNow()}
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
