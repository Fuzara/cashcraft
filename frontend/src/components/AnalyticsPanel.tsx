"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Wallet, Transaction } from "../app/dashboard/page";

const COLORS = ["#2F80ED", "#56CCF2", "#F2994A", "#27AE60", "#EB5757"];

const AnalyticsSkeleton = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="bg-gray-200 rounded-xl h-64"></div>
    <div className="bg-gray-200 rounded-xl h-64"></div>
  </div>
);

export default function AnalyticsPanel({
  wallets,
  transactions,
}: {
  wallets: Wallet[];
  transactions: Transaction[];
}) {
  const walletDistribution = useMemo(() => {
    return wallets.map((wallet) => ({
      name: wallet.name,
      value: Number(wallet.balance),
    }));
  }, [wallets]);

  const spendingTrend = useMemo(() => {
    // This is mocked data as per the requirements
    return [
      { name: "Week 1", spent: 400 },
      { name: "Week 2", spent: 300 },
      { name: "Week 3", spent: 500 },
      { name: "Week 4", spent: 280 },
    ];
  }, []);

  if (!wallets || wallets.length === 0) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">
            Wallet Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={walletDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {walletDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">
            Weekly Spending
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}