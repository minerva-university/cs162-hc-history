"use client";

import React, { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Activity, AlertCircle as AlertCircleIcon, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RadarDataItem {
  subject: string;
  score: number;
}

interface RadarPerformanceChartProps {
  data: RadarDataItem[]; 
  showHCs: boolean;
  toggleShowHCs: () => void;
  animate: boolean;
}

export default function RadarPerformanceChart({
  data,
  showHCs,
  toggleShowHCs,
  animate,
}: RadarPerformanceChartProps) {
  const filteredRadarData = useMemo(() => {
    return data.filter((item) => {
      const isLO = item.subject.includes("-");
      return showHCs ? !isLO : isLO;
    });
  }, [data, showHCs]);

  const labelMap = useMemo(() => {
    const courseGroups = new Map<string, number[]>();

    filteredRadarData.forEach((item, idx) => {
      if (!item.subject.includes("-")) return;
      const course = item.subject.split("-")[0];
      if (!courseGroups.has(course)) courseGroups.set(course, []);
      courseGroups.get(course)!.push(idx);
    });

    const map = new Map<string, string>();

    courseGroups.forEach((indices, course) => {
      const centerIndex = indices[Math.floor(indices.length / 2)];
      indices.forEach((idx, i) => {
        map.set(
          filteredRadarData[idx].subject,
          i === Math.floor(indices.length / 2) ? course : ""
        );
      });
    });

    filteredRadarData.forEach((item) => {
      if (!item.subject.includes("-")) map.set(item.subject, item.subject);
    });

    return map;
  }, [filteredRadarData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="border-none shadow-lg overflow-hidden h-[450px]">
        <CardHeader className="p-4 border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#8B6BF2]" />
              {showHCs ? "HC Performance Radar" : "LO Performance Radar"}
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-[#64748B] cursor-help ml-1" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4">
                    <p className="font-medium mb-1">What is this chart?</p>
                    <p className="text-sm mb-2">This radar chart shows your average scores across different {showHCs ? "HCs" : "LOs"}.</p>
                    <p className="text-sm mb-2">Each point on the perimeter represents a different {showHCs ? "HC" : "LO"}, and the distance from the center indicates your score (higher is better).</p>
                    <p className="text-sm">Use this chart to identify your strongest and weakest areas at a glance. Look for the smallest sections of the web to find areas for improvement.</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-[#334155] border-[#E2E8F0]"
              onClick={toggleShowHCs}
            >
              {showHCs ? "Switch to LOs" : "Switch to HCs"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-[380px] relative">
          {data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  No data available. Please ensure that you follow setup steps in README to
                  ensure backend is running
                </p>
              </div>
            </div>
          ) : filteredRadarData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-[#64748B] text-center">
                No {showHCs ? "HC" : "LO"} data available for current filters
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={filteredRadarData}
              >
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={({ payload, x, y, textAnchor }) => {
                    const value = payload.value;
                    const label = labelMap.get(value) || "";
                    const isLO = value.includes("-");
                    const displayLabel = isLO ? label.toUpperCase() : label;
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        fill="#64748B"
                        fontSize={10}
                      >
                        {displayLabel}
                      </text>
                    );
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 5]}
                  tick={{ fill: "#64748B", fontSize: 10 }}
                />
                <Radar
                  name="Average Score"
                  dataKey="score"
                  stroke="#8B6BF2"
                  fill="#8B6BF2"
                  fillOpacity={0.6}
                  isAnimationActive={animate}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, "Score"]}
                  labelFormatter={(label) => `${label}`}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
          {filteredRadarData.length > 0 && (
            <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500 px-4">
              <p>Tip: Larger web areas indicate stronger performance. Hover over points for exact scores.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
