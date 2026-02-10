"use client";

import { Card, Row, Col, Statistic } from "antd";
import { DashboardSummary } from "@/interface/common/common";
import { formatCurrency } from "@/lib/utils";

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

export const DashboardSummaryCards = ({
  summary,
}: DashboardSummaryCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="You owe"
            value={formatCurrency(summary.youOwe)}
            valueStyle={{ color: '#ef4444', fontSize: 24, fontWeight: 'bold' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="You're owed"
            value={formatCurrency(summary.youAreOwed)}
            valueStyle={{ color: '#22c55e', fontSize: 24, fontWeight: 'bold' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Active Expenses"
            value={summary.activeExpenses}
            valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
          />
        </Card>
      </Col>
    </Row>
  );
};
