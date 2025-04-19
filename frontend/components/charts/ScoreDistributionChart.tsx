"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2, AlertCircle as AlertCircleIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ScoreDistributionEntry {
  score: number;
  count: number;
  name: string;
  color: string;
}

interface ScoreDistributionChartProps {
  data: ScoreDistributionEntry[];
  animate: boolean;
}

export default function ScoreDistributionChart({ data, animate }: ScoreDistributionChartProps) {
  const hasData = data && data.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="border-none shadow-lg overflow-hidden h-[450px]">
        <CardHeader className="p-4 border-b border-[#E2E8F0]">
          <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#8B6BF2]" />
            Score Distribution
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            {hasData ? (
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                barGap={0}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="score"
                  fontSize={12}
                  tick={{ fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                  label={{
                    value: "Score",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#64748B",
                  }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                  label={{
                    value: "Frequency",
                    angle: -90,
                    position: "insideLeft",
                    offset: -15,
                    fill: "#64748B",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, "Frequency"]}
                  labelFormatter={(label) => {
                    const scoreItem = data.find((item) => item.score === Number(label));
                    return scoreItem ? `${label} - ${scoreItem.name}` : label;
                  }}
                />
                <Bar dataKey="count" name="Frequency" isAnimationActive={animate}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center p-4">
                  <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No data available. Please ensure that you follow setup steps in README to
                    ensure backend is running
                  </p>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}