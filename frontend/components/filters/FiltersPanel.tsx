"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Filter as FilterIcon,
  BookOpen,
  Calendar,
  Star,
} from "lucide-react";

import {
    MultiSelect,
    MultiSelectOption,
    MultiSelectStyleInjector,
  } from "@/components/ui/MultiSelect";
// ────── Types ───────────────────────────────────────────────────────────────
export interface Option {
  value: string;
  label: string;
}

interface FiltersPanelProps {
  // dropdown options
  hcOptions: Option[];
  courseOptions: Option[];
  termOptions: Option[];

  // controlled selections
  selectedHCs: string[];
  selectedCourses: string[];
  selectedTerms: string[];

  // handlers
  onChangeHCs: (vals: string[]) => void;
  onChangeCourses: (vals: string[]) => void;
  onChangeTerms: (vals: string[]) => void;

  // score range
  minScore: number;
  maxScore: number;
  onMinScoreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxScoreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // reset button
  onReset: () => void;
}

/**
 * Extracted filter section. Renders HC/LO, Course, Term MultiSelects + score
 * range and a "Reset" button.
 */
export default function FiltersPanel({
  hcOptions,
  courseOptions,
  termOptions,
  selectedHCs,
  selectedCourses,
  selectedTerms,
  onChangeHCs,
  onChangeCourses,
  onChangeTerms,
  minScore,
  maxScore,
  onMinScoreChange,
  onMaxScoreChange,
  onReset,
}: FiltersPanelProps) {
  return (
    <Card className="mb-6 border-none shadow-lg bg-white overflow-hidden">
      {/* make sure the react-select CSS is injected */}
      <MultiSelectStyleInjector />

      <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FilterIcon className="h-4 w-4" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-[#38BDF8] hover:bg-[#1E293B]"
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* HC/LO */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> HC/LO Type
            </label>
            <MultiSelect
              options={hcOptions}
              selected={selectedHCs}
              onChange={onChangeHCs}
              placeholder="Select HC/LO types"
            />
          </div>

          {/* Course */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Course
            </label>
            <MultiSelect
              options={courseOptions}
              selected={selectedCourses}
              onChange={onChangeCourses}
              placeholder="Select courses"
            />
          </div>

          {/* Term */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Term
            </label>
            <MultiSelect
              options={termOptions}
              selected={selectedTerms}
              onChange={onChangeTerms}
              placeholder="Select terms"
            />
          </div>

          {/* Score range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" /> Score Range
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min={1}
                max={5}
                value={minScore}
                onChange={onMinScoreChange}
                className="w-20 border-[#E2E8F0] focus:ring-[#38BDF8]"
              />
              <span className="text-[#64748B]">to</span>
              <Input
                type="number"
                min={1}
                max={5}
                value={maxScore}
                onChange={onMaxScoreChange}
                className="w-20 border-[#E2E8F0] focus:ring-[#38BDF8]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
