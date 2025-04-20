"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface FeedbackItem {
  course_code: string;
  score: number;
}

interface ByCourseTableProps {
  filteredData: FeedbackItem[];
}

export default function ByCourseTable({ filteredData }: ByCourseTableProps) {
  // Group scores by course and calculate average
  const groupedData = filteredData.reduce<Array<{ course_code: string; totalScore: number; count: number }>>(
    (acc, item) => {
      const existing = acc.find((row) => row.course_code === item.course_code);
      if (existing) {
        existing.totalScore += item.score;
        existing.count += 1;
      } else {
        acc.push({ course_code: item.course_code, totalScore: item.score, count: 1 });
      }
      return acc;
    },
    []
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4">
          <CardTitle className="text-xl font-bold">Course Analysis</CardTitle>
          <CardDescription className="text-[#94A3B8] mt-1">
            Detailed performance metrics by course
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Average Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {groupedData.map((row) => (
                  <tr key={row.course_code} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 whitespace-nowrap text-[#334155] font-medium">
                      {row.course_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#334155]">
                      {(row.totalScore / row.count).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
