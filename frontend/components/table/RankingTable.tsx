"use client";

import React, { useMemo, useState } from "react";
import { Award, Download, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeedbackItem {
    score: number;
    comment: string;
    outcome_name: string;
    assignment_title: string;
    course_title: string;
    course_code: string;
    term_title: string;
    created_on: string;
    weight: string;
    weight_numeric?: number;
  }
  

export default function RankingTable({ data }: { data: FeedbackItem[] }) {
  const [showType, setShowType] = useState<"HC" | "LO" | "All">("All");
  const [sortAscending, setSortAscending] = useState(true);

  const avgScore = useMemo(() => {
    if (data.length === 0) return "N/A";
    const total = data.reduce((sum, item) => sum + item.score, 0);
    return (total / data.length).toFixed(2);
  }, [data]);

  const outcomeStats = useMemo(() => {
    const stats = new Map<
      string,
      { totalScore: number; count: number; isHC: boolean }
    >();

    data.forEach((item) => {
      if (!item.outcome_name) return;
      if (!stats.has(item.outcome_name)) {
        const isHC = !item.outcome_name.includes("-");
        stats.set(item.outcome_name, { totalScore: 0, count: 0, isHC });
      }

      const current = stats.get(item.outcome_name)!;
      current.totalScore += item.score;
      current.count += 1;
    });

    return stats;
  }, [data]);

  const rankedOutcomes = useMemo(() => {
    return Array.from(outcomeStats.entries())
      .map(([name, stats]) => ({
        name,
        avgScore: stats.totalScore / stats.count,
        count: stats.count,
        isHC: stats.isHC,
      }))
      .filter((o) => {
        if (showType === "All") return true;
        return showType === "HC" ? o.isHC : !o.isHC;
      })
      .sort((a, b) =>
        sortAscending ? a.avgScore - b.avgScore : b.avgScore - a.avgScore
      );
  }, [outcomeStats, showType, sortAscending]);

  const getScoreColorClass = (score: number) => {
    if (score >= 4.5) return "text-[#8B6BF2]";
    if (score >= 3.5) return "text-[#3A4DB9]";
    if (score >= 2.5) return "text-[#73C173]";
    if (score >= 1.5) return "text-[#E89A5D]";
    return "text-[#E85D5D]";
  };

  return (
    <motion.div
      className=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-lg overflow-hidden mb-6">
        <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4">
          <CardTitle className="text-xl font-bold">Overall Performance</CardTitle>
          <CardDescription className="text-[#94A3B8] mt-1">
            Aggregated metrics across all categories
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-bold text-[#334155]">{avgScore}</h2>
            <p className="text-[#64748B]">
              Average score across all learning outcomes and courses
            </p>

            <div className="mt-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-[#334155] border-[#E2E8F0]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Complete Dataset
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem
                    onClick={() =>
                      window.open("http://localhost:5001/api/export-all", "_blank")
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download CSV</span>
                  </DropdownMenuItem>
                  <div className="px-2 py-1.5 text-xs text-gray-500">
                    Exports your entire dataset without any filters
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ──────────── Ranking Table ──────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-300" />
              HC/LO Ranking
            </CardTitle>
            <CardDescription className="text-[#94A3B8] mt-1">
              Areas ranked from weakest to strongest based on average scores
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-[#E2E8F0] gap-3">
                <h3 className="font-medium text-[#0F172A]">
                  Showing {rankedOutcomes.length} {showType} outcomes
                </h3>

                <div className="flex flex-wrap gap-3">
                  {/* Filter buttons */}
                  <div className="flex space-x-2">
                    {(["All", "HC", "LO"] as const).map((type) => (
                      <Button
                        key={type}
                        variant={showType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowType(type)}
                        className={showType === type ? "bg-[#0F172A]" : ""}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortAscending((prev) => !prev)}
                    className="flex items-center gap-1 ml-2"
                  >
                    {sortAscending ? (
                      <>
                        <span className="text-red-500">⬇️</span> Weakest First
                      </>
                    ) : (
                      <>
                        <span className="text-green-500">⬆️</span> Strongest First
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="bg-[#F1F5F9]">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-[#64748B] uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-[#64748B] uppercase tracking-wider">
                      HC/LO
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs text-[#64748B] uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs text-[#64748B] uppercase tracking-wider">
                      Feedback Count
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {rankedOutcomes.map((outcome, index) => (
                    <tr
                      key={outcome.name}
                      className={`hover:bg-[#F8FAFC] ${
                        sortAscending && index < 3
                          ? "bg-red-50"
                          : !sortAscending && index < 3
                          ? "bg-green-50"
                          : ""
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-4 sm:px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{outcome.name}</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              outcome.isHC
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {outcome.isHC ? "HC" : "LO"}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-4 sm:px-6 py-4 whitespace-nowrap text-right font-bold ${getScoreColorClass(
                          outcome.avgScore
                        )}`}
                      >
                        {outcome.avgScore.toFixed(2)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-[#64748B]">
                        {outcome.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rankedOutcomes.length === 0 && (
                <div className="py-12 text-center text-[#64748B]">
                  <AlertCircle className="h-12 w-12 mx-auto text-[#E2E8F0] mb-3" />
                  <p>No data available for the selected type</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
