"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { BarChart2, AlertCircle as AlertCircleIcon } from "lucide-react";

interface ClassComparisonData {
  course: string;
  averageScore: number;
  courseTitle?: string;
}

interface ClassComparisonChartProps {
  data: ClassComparisonData[];
  selectedHC: string;
  onChangeHC: (value: string) => void;
  uniqueHCs: string[];
  animate: boolean;
}

export default function ClassComparisonChart({
  data,
  selectedHC,
  onChangeHC,
  uniqueHCs,
  animate,
}: ClassComparisonChartProps) {
  const average =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.averageScore, 0) / data.length
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="border-none shadow-lg overflow-hidden h-[450px]">
        <CardHeader className="p-4 border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-[#8B6BF2]" />
              Class Comparison
            </CardTitle>
            <Select
              value={selectedHC || "All"}
              onValueChange={(v) => onChangeHC(v === "All" ? "" : v)}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs border-[#E2E8F0] focus:ring-[#38BDF8]">
                <SelectValue placeholder="Select HC/LO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All HC/LOs</SelectItem>
                {uniqueHCs.map((hc) => (
                  <SelectItem key={hc} value={hc}>{hc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-4 h-[380px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 40, bottom: 75 }}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="course"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  label={{
                    value: "Course",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#64748B",
                  }}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                  label={{
                    value: "Average Score",
                    angle: -90,
                    position: "center",
                    dx: -35,
                    fill: "#64748B",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, "Average Score"]}
                  labelFormatter={(label) => {
                    const course = data.find((item) => item.course === label);
                    return course ? `${label} - ${course.courseTitle}` : label;
                  }}
                />
                <Bar
                  dataKey="averageScore"
                  name="Average Score"
                  fill="#3A4DB9"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={animate}
                />
                <ReferenceLine
                  y={average}
                  stroke="#0F172A"
                  strokeDasharray="3 3"
                  ifOverflow="extendDomain"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  No data available. Please ensure that you follow setup steps
                  in README to ensure backend is running
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
