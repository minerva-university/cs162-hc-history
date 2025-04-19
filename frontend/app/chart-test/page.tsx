"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Filters from "@/components/feedback/Filters";

// Use dynamic import to avoid hydration issues
const ScoreDistributionChart = dynamic(
  () => import("@/components/feedback/ScoreDistributionChart"),
  { ssr: false }
);

export default function DevTestPage() {
  const [selectedHCs, setSelectedHCs] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(1);
  const [maxScore, setMaxScore] = useState<number>(5);

  const mockDistributionData = [
    { score: 1, count: 5, color: "#E85D5D", name: "Lacks knowledge" },
    { score: 2, count: 10, color: "#E89A5D", name: "Superficial knowledge" },
    { score: 3, count: 30, color: "#73C173", name: "Knowledge" },
    { score: 4, count: 40, color: "#3A4DB9", name: "Deep knowledge" },
    { score: 5, count: 15, color: "#8B6BF2", name: "Profound knowledge" },
  ];

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold">🧪 Score Distribution Chart Test</h1>

      <Filters
        uniqueHCs={["Critical Thinking", "Communication"]}
        uniqueCourses={["CS101", "PSY200"]}
        uniqueTerms={["Fall 2023", "Spring 2024"]}
        selectedHCs={selectedHCs}
        setSelectedHCs={setSelectedHCs}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        selectedTerms={selectedTerms}
        setSelectedTerms={setSelectedTerms}
        minScore={minScore}
        setMinScore={setMinScore}
        maxScore={maxScore}
        setMaxScore={setMaxScore}
        resetFilters={() => {
          setSelectedHCs([]);
          setSelectedCourses([]);
          setSelectedTerms([]);
          setMinScore(1);
          setMaxScore(5);
        }}
      />

      <ScoreDistributionChart
        data={mockDistributionData}
        animate={true}
        noData={false}
      />
    </div>
  );
}
