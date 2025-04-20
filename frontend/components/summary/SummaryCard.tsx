"use client";

import React from "react";
import { motion } from "framer-motion"; 
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Lightbulb, AlertTriangle, Check, ArrowUpRight } from "lucide-react";

interface FeedbackItem {
  score: number;
  comment: string;
  outcome_name: string;
  assignment_title: string;
  course_title: string;
  course_code: string;
  term_title: string;
  created_on: string;
  weight: string;           // e.g., "8x"
  weight_numeric?: number;   // e.g., 8
}

interface AISummary {
  outcome_name: string;
  outcome_id: number;
  outcome_description: string;
  strengths_text: string;
  improvement_text: string;
  last_updated: string;
}

interface SummaryCardProps {
  filteredData: FeedbackItem[];
  selectedHCs: string[];            // all HCs currently picked in the filter panel
  currentSummaryHC: string;         // which HC/LO to display in the AI box
  onChangeSummaryHC: (hc: string) => void;
  aiSummaries: AISummary[];         // array returned by /api/ai‑summaries
}

/**
 * Renders the big top‑of‑page summary: average score, counts, and AI‑generated
 * strengths / areas for improvement. The calling page handles layout; this
 * component is purely presentational.
 */
export default function SummaryCard({
  filteredData,
  selectedHCs,
  currentSummaryHC,
  onChangeSummaryHC,
  aiSummaries,
}: SummaryCardProps) {
  // ─── Helpers ──────────────────────────────────────────────────────────────

  const average = React.useMemo(() => {
    if (!filteredData.length) return 0;
    const sum = filteredData.reduce((s, x) => s + x.score, 0);
    return +(sum / filteredData.length).toFixed(1);
  }, [filteredData]);

  const courseCount = React.useMemo(() => {
    return new Set(filteredData.map(x => x.course_code)).size;
  }, [filteredData]);

  const { pros, cons } = React.useMemo(() => {
    if (!currentSummaryHC) {
      return {
        pros: ["Select an HC/LO to see AI‑generated insights"],
        cons: ["Select an HC/LO to see AI‑generated insights"],
      };
    }
    const s = aiSummaries.find(a => a.outcome_name === currentSummaryHC);
    if (!s) {
      return {
        pros: ["No AI summary available for this HC/LO"],
        cons: ["No AI summary available for this HC/LO"],
      };
    }
    const clean = (txt?: string) =>
      txt
        ? txt
            .split("\n")
            .filter(Boolean)
            .map(item => item.replace(/^[-\s]+/, ""))
        : [];
    return { pros: clean(s.strengths_text), cons: clean(s.improvement_text) };
  }, [currentSummaryHC, aiSummaries]);

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <Card className="border-none shadow-lg overflow-hidden mb-6">
      <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">
            {selectedHCs.length === 1
              ? selectedHCs[0]
              : selectedHCs.length > 1
              ? `${selectedHCs.length} HCs/LOs Selected`
              : "All HCs/LOs"}
            {" "}– Average Score: {average.toFixed(1)}
          </CardTitle>
          <CardDescription className="text-[#94A3B8] mt-1">
            Based on {filteredData.length} responses across {courseCount} courses
          </CardDescription>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="text-[#0F172A] border-[#0F172A] hover:text-white hover:border-white hover:bg-[#1E293B]"
            onClick={() =>
              window.open(
                "https://my.minerva.edu/academics/hc-resources/hc-handbook/",
                "_blank"
              )
            }
          >
            HC Handbook <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </motion.div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {selectedHCs.length > 1 && (
            <div className="w-full">
              <p className="text-sm text-[#64748B] mb-2">
                Select which AI summary to display among your chosen HC/LOs:
              </p>
              <Select value={currentSummaryHC} onValueChange={onChangeSummaryHC}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder="Choose an HC/LO" />
                </SelectTrigger>
                <SelectContent>
                  {selectedHCs.map(hc => (
                    <SelectItem key={hc} value={hc} className="pr-8">
                      {hc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 ">
                <Lightbulb className="h-5 w-5 text-[#73C173]" />
                <h3 className="font-semibold text-[#0F172A]">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {pros.map((item, i) => (
                  <motion.li key={`pro-${i}`} className="flex items-start gap-2">
                    <span className="mt-1 rounded-full bg-[#73C173]/20 p-0.5">
                      <Check className="h-3 w-3 text-[#73C173]" />
                    </span>
                    <span className="text-sm text-[#334155]">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Areas for improvement */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 ">
                <AlertTriangle className="h-5 w-5 text-[#E89A5D]" />
                <h3 className="font-semibold text-[#0F172A]">Areas for Improvement</h3>
              </div>
              <ul className="space-y-2">
                {cons.map((item, i) => (
                  <motion.li key={`con-${i}`} className="flex items-start gap-2">
                    <span className="mt-1 rounded-full bg-[#E89A5D]/20 p-0.5">
                      <AlertTriangle className="h-3 w-3 text-[#E89A5D]" />
                    </span>
                    <span className="text-sm text-[#334155]">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
