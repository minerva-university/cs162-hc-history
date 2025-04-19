// src/components/feedback/Filters.tsx
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Calendar, BookOpen, Star } from "lucide-react";
import {
  MultiSelect,
  MultiSelectOption,
  MultiSelectStyleInjector,
} from "@/components/ui/MultiSelect";

interface FiltersProps {
  uniqueHCs: string[];
  uniqueCourses: string[];
  uniqueTerms: string[];
  selectedHCs: string[];
  setSelectedHCs: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCourses: string[];
  setSelectedCourses: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTerms: string[];
  setSelectedTerms: React.Dispatch<React.SetStateAction<string[]>>;
  minScore: number;
  setMinScore: React.Dispatch<React.SetStateAction<number>>;
  maxScore: number;
  setMaxScore: React.Dispatch<React.SetStateAction<number>>;
  resetFilters: () => void;
}

export default function Filters({
  uniqueHCs,
  uniqueCourses,
  uniqueTerms,
  selectedHCs,
  setSelectedHCs,
  selectedCourses,
  setSelectedCourses,
  selectedTerms,
  setSelectedTerms,
  minScore,
  setMinScore,
  maxScore,
  setMaxScore,
  resetFilters,
}: FiltersProps) {
  const hcOptions: MultiSelectOption[] = useMemo(
    () => uniqueHCs.map((hc) => ({ value: hc, label: hc })),
    [uniqueHCs]
  );
  const courseOptions: MultiSelectOption[] = useMemo(
    () => uniqueCourses.map((c) => ({ value: c, label: c })),
    [uniqueCourses]
  );
  const termOptions: MultiSelectOption[] = useMemo(
    () => uniqueTerms.map((t) => ({ value: t, label: t })),
    [uniqueTerms]
  );

  function handleMinScoreChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setMinScore(v >= 1 && v <= maxScore ? v : 1);
  }
  function handleMaxScoreChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setMaxScore(v <= 5 && v >= minScore ? v : 5);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      {/* inject multi-select styles */}
      <MultiSelectStyleInjector />

      <Card className="mb-6 border-none shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4 flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-white hover:text-[#38BDF8]" onClick={resetFilters}>
            Reset
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* HC/LO Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                HC/LO Type
              </label>
              <MultiSelect
                options={hcOptions}
                selected={selectedHCs}
                onChange={setSelectedHCs}
                placeholder="Select HC/LO types"
              />
            </div>

            {/* Course */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Course
              </label>
              <MultiSelect
                options={courseOptions}
                selected={selectedCourses}
                onChange={setSelectedCourses}
                placeholder="Select courses"
              />
            </div>

            {/* Term */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Term
              </label>
              <MultiSelect
                options={termOptions}
                selected={selectedTerms}
                onChange={setSelectedTerms}
                placeholder="Select terms"
              />
            </div>

            {/* Score Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" />
                Score Range
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={minScore}
                  onChange={handleMinScoreChange}
                  className="w-20 border-[#E2E8F0] focus:ring-[#38BDF8]"
                />
                <span className="text-[#64748B]">to</span>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={maxScore}
                  onChange={handleMaxScoreChange}
                  className="w-20 border-[#E2E8F0] focus:ring-[#38BDF8]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
