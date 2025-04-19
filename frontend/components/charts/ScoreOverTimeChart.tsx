"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  MoreVertical,
  AlertCircle as AlertCircleIcon,
  TrendingUp,
} from "lucide-react";

interface Point {
  month: string;
  score: number;
}

interface ScoreOverTimeChartProps {
  data: Point[];
  animate: boolean;
}

export default function ScoreOverTimeChart({ data, animate }: ScoreOverTimeChartProps) {
  const hasData = data.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-none shadow-lg overflow-hidden h-[450px]">
        <CardHeader className="p-4 border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#8B6BF2]" />
              Scores over time
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-4 h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            {hasData ? (
              <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                />
                <Tooltip
                  formatter={(v: number) => [`${v}`, "Score"]}
                  labelFormatter={(l) => `Month: ${l}`}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Area 
                    type="monotone" 
                    dataKey="score"
                    fill="#8B6BF2"
                    fillOpacity={0.1}
                    stroke="none" />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Average Score"
                  stroke="#8B6BF2"
                  strokeWidth={3}
                  dot={{ fill: "#8B6BF2", r: 5, strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ fill: "#8B6BF2", r: 7, strokeWidth: 2, stroke: "#FFFFFF" }}
                  isAnimationActive={animate}
                />
                <ReferenceLine y={3} stroke="#64748B" strokeDasharray="3 3" />
              </LineChart>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center p-4">
                  <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No data available. Please ensure the backend is running and filters are correct.
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
