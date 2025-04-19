// components/FeedbackPlatform.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradeLegend } from "@/components/ui/GradeLegend";
import { Filter, Calendar, BookOpen, Star, ArrowUpRight, Download, MoreVertical, AlertCircle as AlertCircleIcon, TrendingUp, BarChart2, Activity, MessageSquare, Clock, Lightbulb, Check, AlertTriangle, Award } from "lucide-react";
import {
  MultiSelectStyleInjector,
} from "@/components/ui/MultiSelect";

import FiltersPanel from "./components/filters/FiltersPanel";
import SummaryCard from "./components/summary/SummaryCard";
import ErrorCard from "./components/summary/ErrorCard";
import ScoreOverTimeChart from "./components/charts/ScoreOverTimeChart";
import ScoreDistributionChart from "./components/charts/ScoreDistributionChart";
import RadarPerformanceChart from "./components/charts/RadarPerformanceChart";
import ClassComparisonChart from "./components/charts/ClassComparisonChart";
import FeedbackTable from "./components/table/FeedbackTable";
import ByCourseTable from "./components/table/ByCourseTable"
import RankingTable from "./components/table/RankingTable";



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

// Add new interface for AI summaries
interface AISummary {
  outcome_name: string;
  outcome_id: number;
  outcome_description: string;
  strengths_text: string;
  improvement_text: string;
  last_updated: string;
}

export default function FeedbackPlatform() {
  // ─── State hooks ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]             = useState<string>("byHC");
  const [animateCharts, setAnimateCharts]     = useState(false);

  const [feedbackData, setFeedbackData]       = useState<FeedbackItem[]>([]);
  const [filteredData, setFilteredData]       = useState<FeedbackItem[]>([]);

  const [selectedHCs, setSelectedHCs]         = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms]     = useState<string[]>([]);

  const [minScore, setMinScore]               = useState<number>(1);
  const [maxScore, setMaxScore]               = useState<number>(5);

  const [uniqueHCs, setUniqueHCs]             = useState<string[]>([]);
  const [uniqueCourses, setUniqueCourses]     = useState<string[]>([]);
  const [uniqueTerms, setUniqueTerms]         = useState<string[]>([]);

  const [dbError, setDbError]                 = useState<string>("");
  const [classComparisonHC, setClassComparisonHC] = useState<string>("");

  const [aiSummaries, setAiSummaries]         = useState<AISummary[]>([]);
  const [showHCs, setShowHCs]                 = useState(true);
  const [currentSummaryHC, setCurrentSummaryHC] = useState<string>("");

  // ─── Effects: fetch, filter, animations ────────────────────────────────────

  useEffect(() => {
    async function fetchData() {
      try {
        // fetch feedback
        console.log("Attempting to fetch data from API...");
        const response = await fetch('http://localhost:5001/api/feedback');
        if (!response.ok) throw new Error(`HTTP error! Status ${response.status}`);
        const values = await response.json() as FeedbackItem[];

        // extract uniques for filters
        const hcs = [...new Set(values.map((item: FeedbackItem) => item.outcome_name))].filter(Boolean);

        const sortedHCs = hcs.sort((a, b) => {
          // Check if either item is an LO (contains a hyphen and course code)
          const aIsLO = a.includes('-');
          const bIsLO = b.includes('-');
          
          // If both are HCs or both are LOs, sort alphabetically
          if ((aIsLO && bIsLO) || (!aIsLO && !bIsLO)) {
            return a.localeCompare(b);
          }
          
          // If only one is an LO, place HCs first
          return aIsLO ? 1 : -1;
        });
        
        // Create combined course information (code + title)
        const coursesMap = new Map<string, string>();
        values.forEach((item: FeedbackItem) => {
          if (item.course_code && !coursesMap.has(item.course_code)) {
            coursesMap.set(item.course_code, `${item.course_code} - ${item.course_title}`);
          }
        });

        const courses = Array.from(coursesMap.keys());
        const terms = [...new Set(values.map((item: FeedbackItem) => item.term_title))].filter(Boolean);

        console.log("Unique HCs/LOs:", sortedHCs);
        console.log("Unique Courses:", courses);
        console.log("Unique Terms:", terms);

        setUniqueHCs(sortedHCs);
        setUniqueCourses(courses);
        setUniqueTerms(terms);
        setFeedbackData(values);
        setFilteredData(values);

        // Clear any previous errors
        setDbError("");

        // fetch AI summaries
        const summariesResponse = await fetch('http://localhost:5001/api/ai-summaries');
        const summariesValues: AISummary[] = await summariesResponse.json();
        setAiSummaries(summariesValues);
      } catch (error) {
        console.error("Error loading data from API:", error);
        setDbError(`Error loading data: ${String(error)}`);

        setUniqueHCs([]);
        setUniqueCourses([]);
        setUniqueTerms([]);
        setFeedbackData([]);
        setFilteredData([]);


      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedHCs.length > 0) {
      setCurrentSummaryHC(selectedHCs[0]);
    } else {
      setCurrentSummaryHC("");
    }
  }, [selectedHCs]);

  // Filter data based on selected criteria
  useEffect(() => {
    let filtered = feedbackData;
    // Update filtering logic to handle arrays of selections
    if (selectedHCs.length > 0) {
      filtered = filtered.filter(item => selectedHCs.includes(item.outcome_name));
    }
    
    if (selectedCourses.length > 0) {
      filtered = filtered.filter(item => selectedCourses.includes(item.course_code));
    }
    
    if (selectedTerms.length > 0) {
      filtered = filtered.filter(item => selectedTerms.includes(item.term_title));
    }
    
    filtered = filtered.filter(item => item.score >= minScore && item.score <= maxScore);
    
    console.log("Filtering applied:", {
      selectedHCs,
      selectedCourses,
      selectedTerms,
      minScore,
      maxScore
    });
    console.log("Filtered data count:", filtered.length);
    
    setFilteredData(filtered);
    
  }, [feedbackData, selectedHCs, selectedCourses, selectedTerms, minScore, maxScore]);

  // Trigger animations after initial half a second load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCharts(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  function getTabLabel(tab: string): string {
    switch (tab) {
      case "byHC": return "By HC and LO";
      case "byCourse": return "By Course";
      default: return "Overall";
    }
  }

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const hcOptions = useMemo(() => 
    uniqueHCs.map(hc => ({ value: hc, label: hc })),
    [uniqueHCs]
  );
  
  const courseOptions = useMemo(() => 
    uniqueCourses.map(courseCode => {
      const courseItem = feedbackData.find(item => item.course_code === courseCode);
      const displayText = courseItem ? 
        `${courseCode} - ${courseItem.course_title}` : 
        courseCode;
      return { value: courseCode, label: displayText };
    }),
    [uniqueCourses, feedbackData]
  );
  
  const termOptions = useMemo(() => 
    uniqueTerms.map(term => ({ value: term, label: term })),
    [uniqueTerms]
  );
  
  const handleMinScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setMinScore(value >= 1 && value <= maxScore ? value : 1);
  };
  const handleMaxScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setMaxScore(value <= 5 && value >= minScore ? value : 5);
  };
  // Add reset filters functionality
  const resetFilters = () => {
    setSelectedHCs([]);
    setSelectedCourses([]);
    setSelectedTerms([]);
    setMinScore(1);
    setMaxScore(5);
    // Reset the filtered data to show all data
    setFilteredData(feedbackData);
  };

  // ─── Derived data (time series, radar, classComparison, etc.) ──────────────
  const generateTimeSeriesData = (data: FeedbackItem[]) => {
    if (!data.length) return [];
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
    );
    
    // Group by month
    const monthlyData = new Map<string, {count: number, totalScore: number}>();
    
    sortedData.forEach(item => {
      const date = new Date(item.created_on);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      const displayKey = `${monthName} ${date.getFullYear()}`;
      
      if (!monthlyData.has(displayKey)) {
        monthlyData.set(displayKey, { count: 0, totalScore: 0 });
      }
      
      const monthData = monthlyData.get(displayKey)!;
      monthData.count += 1;
      monthData.totalScore += item.score;
    });
    
    // Convert to array format needed for chart
    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      score: data.count > 0 ? Number((data.totalScore / data.count).toFixed(2)) : 0
    }));
  };

  // Time series data
  const timeSeriesData = useMemo(() => {
    const generatedData = generateTimeSeriesData(filteredData);
    
    return generatedData.length > 0 ? generatedData : [];
}, [filteredData]);

  const generateScoreDistributionData = useMemo(() => {
    if (!filteredData.length) return [];
    
    // Initialize counters for each score (1-5)
    const scoreCounts = [0, 0, 0, 0, 0];
    
    // Count occurrences of each score
    filteredData.forEach(item => {
      const scoreIndex = Math.floor(item.score) - 1;
      if (scoreIndex >= 0 && scoreIndex < 5) {
        scoreCounts[scoreIndex]++;
      }
    });
    
    // Convert to the format needed for the bar chart
    return [
      { score: 1, count: scoreCounts[0], color: "#E85D5D", name: "Lacks knowledge" },
      { score: 2, count: scoreCounts[1], color: "#E89A5D", name: "Superficial knowledge" },
      { score: 3, count: scoreCounts[2], color: "#73C173", name: "Knowledge" },
      { score: 4, count: scoreCounts[3], color: "#3A4DB9", name: "Deep knowledge" },
      { score: 5, count: scoreCounts[4], color: "#8B6BF2", name: "Profound knowledge" },
    ];
  }, [filteredData]);

  const generateRadarChartData = useMemo(() => {
    if (!filteredData.length) return [];
    
    // Only include HC/LOs that exist in the current filtered dataset
    // Group filtered data by outcome name (HC/LO)
    const hcScores = new Map<string, {totalScore: number, count: number}>();
    
    filteredData.forEach(item => {
      if (!item.outcome_name) return;
      
      if (!hcScores.has(item.outcome_name)) {
        hcScores.set(item.outcome_name, { totalScore: 0, count: 0 });
      }
      
      const scoreData = hcScores.get(item.outcome_name)!;
      scoreData.totalScore += item.score;
      scoreData.count += 1;
    });
    
    // Convert to the format needed for the radar chart
    // Will only include HCs/LOs that are present in the filtered data
    return Array.from(hcScores.entries()).map(([name, data]) => ({
      subject: name,
      score: data.count > 0 ? Number((data.totalScore / data.count).toFixed(1)) : 0,
      fullMark: 5
    }));
  }, [filteredData]);

  // Radar chart placeholder
  const radarData = generateRadarChartData;


  const generateClassComparisonData = useMemo(() => {
    // Start with the currently filtered data, not the entire dataset
    // This ensures all top filters (term, course, score range) are respected
    let dataToUse = filteredData;
    
    // If a specific HC is selected in the class comparison filter, further filter by that
    if (classComparisonHC) {
      dataToUse = dataToUse.filter(item => item.outcome_name === classComparisonHC);
    }
    
    // Get unique course codes from the filtered data
    const uniqueCourses = [...new Set(dataToUse.map(item => item.course_code))].filter(Boolean);
    
    // Calculate average score for each course
    return uniqueCourses.map(courseCode => {
      const courseItems = dataToUse.filter(item => item.course_code === courseCode);
      const totalScore = courseItems.reduce((sum, item) => sum + item.score, 0);
      const avgScore = courseItems.length > 0 ? Number((totalScore / courseItems.length).toFixed(2)) : 0;
      
      // Find a course title for display purposes
      const courseTitle = courseItems[0]?.course_title || courseCode;
      
      return {
        course: courseCode,
        courseTitle: courseTitle,
        averageScore: avgScore,
        count: courseItems.length // Include count for reference
      };
    }).sort((a, b) => a.course.localeCompare(b.course)); // Sort alphabetically by course code
  }, [filteredData, classComparisonHC]); // Now depends on filteredData instead of feedbackData


  // ─── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Inject the styles for the MultiSelect component */}
      <MultiSelectStyleInjector />
      
      {/* Header with navigation tabs */}
      <header className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 py-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <img 
                src="https://minerva-orgs.s3.us-west-2.amazonaws.com/production/e9fd1c3c-b16f-11e8-9bf9-0622cf94bff4/mu-darkbg.png?v=fc61135b6a13fea802d4c4373cd4dc420fee7850" 
                alt="Minerva Logo" 
                style={{ 
                  objectFit: "cover", 
                  width: "4.5rem", 
                  height: "4.5rem" 
                }}
              />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight">HC and LO Feedback</h1>
          </div>
          <div className="w-full px-4">
            <Tabs defaultValue="byHC" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-b border-[#334155] w-full justify-center rounded-none h-auto p-0 mb-0">
                {["byHC", "byCourse", "overall"].map((tab, index) => (
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TabsTrigger
                      value={tab}
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#38BDF8] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-8 py-2 text-white data-[state=active]:text-[#38BDF8]"
                    >
                      {getTabLabel(tab)}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* ─────────────── MAIN ─────────────── */}
      <div className="pt-[8.5rem] flex-1 max-w-7xl mx-auto px-4 py-6">
        {/* Filters with animation*/}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FiltersPanel
            hcOptions={hcOptions}
            courseOptions={courseOptions}
            termOptions={termOptions}
            selectedHCs={selectedHCs}
            selectedCourses={selectedCourses}
            selectedTerms={selectedTerms}
            minScore={minScore}
            maxScore={maxScore}
            onChangeHCs={setSelectedHCs}
            onChangeCourses={setSelectedCourses}
            onChangeTerms={setSelectedTerms}
            onMinScoreChange={handleMinScoreChange}
            onMaxScoreChange={handleMaxScoreChange}
            onReset={resetFilters}
          />
        </motion.div>

        {/* Debug Section (error or empty state) */}
        {(dbError || filteredData.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ErrorCard error={dbError} onReset={resetFilters} />
          </motion.div>
        )}

        {/* Grade legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GradeLegend />
        </motion.div>
        

        {/* Tab content */}
        {activeTab === "byHC" && (
          <div className="space-y-6">
            {/* AI Summary & Stats */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SummaryCard
                filteredData={filteredData}
                selectedHCs={selectedHCs}
                currentSummaryHC={currentSummaryHC}
                onChangeSummaryHC={setCurrentSummaryHC}
                aiSummaries={aiSummaries}
              />
            </motion.div>

            {/* 2×2 Chart grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScoreOverTimeChart data={timeSeriesData} animate={animateCharts} />
              <ScoreDistributionChart data={generateScoreDistributionData} animate={animateCharts} />
              <RadarPerformanceChart
                data={radarData}
                showHCs={showHCs}
                toggleShowHCs={() => setShowHCs(p => !p)}
                animate={animateCharts}
              />
              <ClassComparisonChart
                data={generateClassComparisonData}
                selectedHC={classComparisonHC}
                onChangeHC={setClassComparisonHC}
                uniqueHCs={uniqueHCs}
                animate={animateCharts}
              />
            </div>

            {/* Recent Feedback table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="p-4 border-b border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#8B6BF2]" />
                      Recent Feedback
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[#334155] border-[#E2E8F0]"
                      onClick={() => {
                        // Build query parameters based on current filters
                        const params = new URLSearchParams();
                        if (selectedHCs.length > 0) params.append('hc', selectedHCs.join(','));
                        if (selectedCourses.length > 0) params.append('course', selectedCourses.join(','));
                        if (selectedTerms.length > 0) params.append('term', selectedTerms.join(','));
                        params.append('minScore', minScore.toString());
                        params.append('maxScore', maxScore.toString());

                        // Open the export URL with filters
                        window.open(`http://localhost:5001/api/export?${params.toString()}`, '_blank');
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FeedbackTable data={filteredData} />
                </CardContent>
                <CardFooter className="p-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div className="text-sm text-[#64748B]">
                    {/* "Export All Data" button removed from here */}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        )}

        {activeTab === "byCourse" && (
          <ByCourseTable filteredData={filteredData} />
        )}

          {activeTab === "overall" && (
            <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <RankingTable data={feedbackData} />
            </motion.div>
          )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img 
                  src="https://minerva-orgs.s3.us-west-2.amazonaws.com/production/e9fd1c3c-b16f-11e8-9bf9-0622cf94bff4/mu-darkbg.png?v=fc61135b6a13fea802d4c4373cd4dc420fee7850" 
                  alt="Minerva Logo" 
                  className="h-14 w-14" 
                />
              </motion.div>
              <span className="font-semibold text-lg">HC and LO Feedback</span>
            </div>
            <div className="text-sm text-[#94A3B8]">© {new Date().getFullYear()} HC and LO Feedback. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
