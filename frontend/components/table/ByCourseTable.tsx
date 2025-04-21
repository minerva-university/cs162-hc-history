"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// ─── Interfaces ───────────────────────────────────────────────────────────────

// Feedback item from the /api/feedback endpoint
interface FeedbackItem {
  course_code: string;
  score: number;
}

// Course score from the /api/course-scores endpoint
interface CourseScore {
  course_code: string;
  course_score: number;
}

// Props for this component
interface ByCourseTableProps {
  filteredData: FeedbackItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ByCourseTable({ filteredData }: ByCourseTableProps) {
  // Store the scores pulled from the backend API
  const [courseScores, setCourseScores] = useState<CourseScore[]>([]);

  // Fetch course-level scores from the backend when the component mounts
  useEffect(() => {
    async function fetchCourseScores() {
      try {
        const response = await fetch("http://localhost:5001/api/course-scores");
        if (!response.ok)
          throw new Error(`HTTP error! Status ${response.status}`);
        const data = await response.json();
        setCourseScores(data);
      } catch (err) {
        console.error("Failed to fetch course scores:", err);
      }
    }

    fetchCourseScores();
  }, []);

  // Group feedback data by course_code and calculate average score
  const groupedData = filteredData.reduce<
    Array<{ course_code: string; totalScore: number; count: number }>
  >((acc, item) => {
    const existing = acc.find((row) => row.course_code === item.course_code);
    if (existing) {
      existing.totalScore += item.score;
      existing.count += 1;
    } else {
      acc.push({
        course_code: item.course_code,
        totalScore: item.score,
        count: 1,
      });
    }
    return acc;
  }, []);

  // Merge in course scores from the API (Forum-sourced scores)
  const mergedData = groupedData.map((row) => {
    const actualScore = courseScores.find(
      (c) => c.course_code === row.course_code
    )?.course_score;

    return {
      ...row,
      averageScore: row.totalScore / row.count,
      courseScore: actualScore ?? null,
    };
  });

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className=""
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
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Average Score
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                    Course Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {mergedData.map((row) => (
                  <tr key={row.course_code} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-[#334155] font-medium">
                      {row.course_code}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-[#334155]">
                      {row.averageScore.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-[#334155]">
                      {row.courseScore !== null
                        ? row.courseScore.toFixed(2)
                        : "—"}
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
