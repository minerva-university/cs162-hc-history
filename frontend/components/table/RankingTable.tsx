"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface FeedbackItem {
  score: number;
  outcome_name: string;
}

interface RankingTableProps {
  data: Readonly<FeedbackItem[]>;
}

export default function RankingTable({ data }: RankingTableProps): React.ReactElement {
  const [showType, setShowType] = useState<"HC" | "LO" | "All">("All");
  const [sortAscending, setSortAscending] = useState<boolean>(true); // true = weakest first, false = strongest first

  // Generate a map of outcome_name to avg score and count
  const outcomeStats = useMemo(() => {
    const stats = new Map<string, { totalScore: number; count: number; isHC: boolean }>();

    data.forEach((item) => {
      if (!item.outcome_name) return;
      if (!stats.has(item.outcome_name)) {
        // Determine if this is an HC (doesn't have a hyphen) or an LO (has a hyphen)
        stats.set(item.outcome_name, {
          totalScore: 0,
          count: 0,
          isHC: !item.outcome_name.includes("-"),
        });
      }
      const current = stats.get(item.outcome_name)!;
      current.totalScore += item.score;
      current.count += 1;
    });
    return stats;
  }, [data]);

  // Convert to array, calculate averages, and sort based on user preference
  const rankedOutcomes = useMemo(() => {
    return Array.from(outcomeStats.entries())
      .map(([name, stats]) => ({
        name,
        avgScore: stats.totalScore / stats.count,
        count: stats.count,
        isHC: stats.isHC,
      }))
      .filter((outcome) => {
        if (showType === "All") return true;
        return showType === "HC" ? outcome.isHC : !outcome.isHC;
      })
      .sort((a, b) => (sortAscending ?
        a.avgScore - b.avgScore : //weakest first (ascending)
        b.avgScore - a.avgScore // strongest first (descending)
    ));
  }, [outcomeStats, showType, sortAscending]);

  // Function to get color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 4.5) return "text-[#8B6BF2]"; // Excellent - Purple
    if (score >= 3.5) return "text-[#3A4DB9]"; // Good - Blue
    if (score >= 2.5) return "text-[#73C173]"; // Average - Green
    if (score >= 1.5) return "text-[#E89A5D]"; // Fair - Orange
    return "text-[#E85D5D]"; // Poor - Red
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-[#E2E8F0] gap-3">
        <h3 className="font-medium text-[#0F172A]">Showing {rankedOutcomes.length} outcomes</h3>
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
            <th className="px-6 py-3 text-left text-xs text-[#64748B] uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs text-[#64748B] uppercase tracking-wider">HC/LO</th>
            <th className="px-6 py-3 text-right text-xs text-[#64748B] uppercase tracking-wider">Avg Score</th>
            <th className="px-6 py-3 text-right text-xs text-[#64748B] uppercase tracking-wider">Feedback Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rankedOutcomes.map((entry, index) => (
            <tr
              key={entry.name}
              className={`hover:bg-[#F8FAFC] ${
                sortAscending && index < 3
                  ? "bg-red-50"
                  : !sortAscending && index < 3
                  ? "bg-green-50"
                  : ""
              }`}
            >
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4 flex items-center gap-2 font-medium">
                <span>{entry.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    entry.isHC ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {entry.isHC ? "HC" : "LO"}
                </span>
              </td>
              <td className={`px-6 py-4 text-right font-bold ${getScoreColorClass(entry.avgScore)}`}>
                {entry.avgScore.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right text-[#64748B]">{entry.count}</td>
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
  );
}
