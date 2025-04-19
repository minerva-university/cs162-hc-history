"use client"
import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  ReferenceLine,
} from "recharts"
import {
  Filter,
  Calendar,
  BookOpen,
  ArrowUpRight,
  Download,
  TrendingUp,
  Star,
  MessageSquare,
  Clock,
  Lightbulb,
  AlertCircle as AlertCircleIcon,
  Activity,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
  BarChart2,
  Play,
  ClipboardList,
} from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GradeLegend } from "./components/ui/GradeLegend"
import { AnimatedScoreCard } from "./animated-score-card"



// Helper functions used in the code
function getTabLabel(tab: string): string {
  switch (tab) {
    case "byHC": return "By HC and LO";
    case "byCourse": return "By Course";
    default: return "Overall";
  }
}

/**
 * Academic Feedback Platform
 * 
 * The main dashboard component that renders the entire feedback platform UI.
 * This component includes:
 * - Header with navigation tabs
 * - Filtering interface
 * - Data visualizations (charts, graphs)
 * - Feedback tables and summaries
 * - Interactive elements and animations
 * 
 * The dashboard displays academic feedback data with multiple views:
 * - By HC or LO
 * - By Course
 * - Overall performance
 * 
 * It fails to show data if the database is not found and redirects the user to the README.
 */

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
  const [activeTab, setActiveTab] = useState<string>("byHC")
  const [animateCharts, setAnimateCharts] = useState(false)
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [filteredData, setFilteredData] = useState<FeedbackItem[]>([]);
  
  // Change single selection states to arrays for multiple selections
  const [selectedHCs, setSelectedHCs] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  
  const [minScore, setMinScore] = useState<number>(1);
  const [maxScore, setMaxScore] = useState<number>(5);
  const [uniqueHCs, setUniqueHCs] = useState<string[]>([]);
  const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);
  const [uniqueTerms, setUniqueTerms] = useState<string[]>([]);
  const [dbError, setDbError] = useState<string>("");
  const [classComparisonHC, setClassComparisonHC] = useState<string>("");
  const [aiSummaries, setAiSummaries] = useState<AISummary[]>([]);
  const [showHCs, setShowHCs] = useState(true); //tracks whether HCs or LOs should be displayed in radar chart
  
  // Add state for currently displayed summary
  const [currentSummaryHC, setCurrentSummaryHC] = useState<string>("");
  
  // Update currentSummaryHC when selectedHCs changes
  useEffect(() => {
    if (selectedHCs.length > 0) {
      setCurrentSummaryHC(selectedHCs[0]);
    } else {
      setCurrentSummaryHC("");
    }
  }, [selectedHCs]);

  // Convert to MultiSelectOption format for dropdowns
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

  // Fetch data from database
  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Attempting to fetch data from API...");
        const response = await fetch('http://localhost:5001/api/feedback');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const values = await response.json() as FeedbackItem[];
        console.log("Data fetched:", values.slice(0, 3));
        
        // Extract unique values for filters with more information
        const hcs = [...new Set(values.map((item: FeedbackItem) => item.outcome_name))].filter(Boolean);
        
        // Sort HCs alphabetically, but keep LOs (with course codes) as they are
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

        // Also update pie chart data based on actual scores
        updatePieChartData(values);
        
        // Clear any previous errors
        setDbError("");

        // New AI summaries fetch
        const summariesResponse = await fetch('http://localhost:5001/api/ai-summaries');
        const summariesValues = await summariesResponse.json();
        setAiSummaries(summariesValues);
      } catch (error) {
        console.error("Error loading data from API:", error);
        setDbError(`Error loading data: ${String(error)}`);

        setUniqueHCs([]);
        setUniqueCourses([]);
        setUniqueTerms([]);
        setFeedbackData([]);
        setFilteredData([]);
        
        // Update pie chart data based on data
        updatePieChartData([]);
      }
    }
  
    fetchData();
  }, []);

  // Function to check if a file exists
  const checkFileExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error(`Error checking for file at ${url}:`, error);
      return false;
    }
  };

  // Function to update pie chart data based on actual scores
  const updatePieChartData = (data: FeedbackItem[]) => {
    // Count the number of each score (1-5)
    const scoreCounts = [0, 0, 0, 0, 0]; // For scores 1-5
    
    data.forEach(item => {
      const scoreIndex = Math.floor(item.score) - 1;
      if (scoreIndex >= 0 && scoreIndex < 5) {
        scoreCounts[scoreIndex]++;
      }
    });
    
    const total = scoreCounts.reduce((sum, count) => sum + count, 0);
    
    // Only update if we have data
    if (total > 0) {
      const newPieData = [
        { name: "Excellent (5)", value: scoreCounts[4], color: "#8B6BF2" },
        { name: "Good (4)", value: scoreCounts[3], color: "#3A4DB9" },
        { name: "Average (3)", value: scoreCounts[2], color: "#73C173" },
        { name: "Fair (2)", value: scoreCounts[1], color: "#E89A5D" },
        { name: "Poor (1)", value: scoreCounts[0], color: "#E85D5D" },
      ];
      
      setPieData(newPieData);
    }
  };

  // State for pie chart data
  const [pieData, setPieData] = useState([
    { name: "Excellent (5)", value: 25, color: "#8B6BF2" },
    { name: "Good (4)", value: 35, color: "#3A4DB9" },
    { name: "Average (3)", value: 20, color: "#73C173" },
    { name: "Fair (2)", value: 15, color: "#E89A5D" },
    { name: "Poor (1)", value: 5, color: "#E85D5D" },
  ]);

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
    
    // Also update pie chart when filters change
    updatePieChartData(filtered);
  }, [feedbackData, selectedHCs, selectedCourses, selectedTerms, minScore, maxScore]);

  // Trigger animations after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCharts(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Add reset filters functionality
  const resetFilters = () => {
    setSelectedHCs([]);
    setSelectedCourses([]);
    setSelectedTerms([]);
    setMinScore(1);
    setMaxScore(5);
    // Reset the filtered data to show all data
    setFilteredData(feedbackData);
    
    // Also update pie chart with all data
    updatePieChartData(feedbackData);
  };

  // Generate time series data from actual feedback data
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
    
    // If we have real data, use it; otherwise fall back to sample data
    return generatedData.length > 0 ? generatedData : [
      { month: "Jan", score: 2.1 },
      { month: "Feb", score: 2.4 },
      { month: "Mar", score: 2.2 },
      { month: "Apr", score: 2.6 },
      { month: "May", score: 3.1 },
      { month: "Jun", score: 3.2 },
      { month: "Jul", score: 3.0 },
      { month: "Aug", score: 3.1 },
      { month: "Sep", score: 3.2 },
    ];
  }, [filteredData]);

  // Sample distribution data for HC scores
  const hcScoreData = [
    { score: 1, Yr1: 10, Yr2: 5, Yr3: 8 },
    { score: 2, Yr1: 15, Yr2: 20, Yr3: 12 },
    { score: 3, Yr1: 25, Yr2: 30, Yr3: 28 },
    { score: 4, Yr1: 12, Yr2: 15, Yr3: 18 },
    { score: 5, Yr1: 6, Yr2: 8, Yr3: 10 },
  ]

  // Generate radar chart data based on filtered data only
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

  // Radar chart data with fallback to sample data if needed
  const radarData = useMemo(() => {
    const data = generateRadarChartData.length > 0 ? generateRadarChartData : [
      { subject: "Professionalism", score: 4.2, fullMark: 5 },
      { subject: "Communication", score: 3.8, fullMark: 5 },
      { subject: "ProblemSolving", score: 4.5, fullMark: 5 },
      { subject: "TechnicalCompetence", score: 3.2, fullMark: 5 },
      { subject: "Teamwork", score: 4.0, fullMark: 5 },
      { subject: "CriticalThinking", score: 3.9, fullMark: 5 },
    ];
    
    return data;
  }, [generateRadarChartData]);

  //Detects and groups LO labels by course prefix (e.g. CS162)
  //Only show one label per course, centered in the group
  const labelMap = useMemo(() => {
    const courseGroups = new Map<string, number[]>(); // course -> list of radarData indices
  
    radarData.forEach((item, idx) => {
      if (!item.subject.includes("-")) return; // skip HCs
      const course = item.subject.split("-")[0];
      if (!courseGroups.has(course)) courseGroups.set(course, []);
      courseGroups.get(course)!.push(idx);
    });
  
    const map = new Map<string, string>();
  
    // Determine center index of each group
    courseGroups.forEach((indices, course) => {
      const centerIndex = indices[Math.floor(indices.length / 2)];
      indices.forEach((idx, i) => {
        map.set(radarData[idx].subject, i === Math.floor(indices.length / 2) ? course : "");
      });
    });
  
    // Pass through HCs unchanged
    radarData.forEach(item => {
      if (!item.subject.includes("-")) map.set(item.subject, item.subject);
    });
  
    return map;
  }, [radarData]);
  
  
  // Filter radar data based on HC/LO type
  const filteredRadarData = useMemo(() => {
    return radarData.filter(item => {
      const isLO = item.subject.includes("-");
      return showHCs ? !isLO : isLO;
    });
  }, [radarData, showHCs]);  

  // Score distribution by category
  const scoreDistributionData = [
    { name: "Clarity", score1: 5, score2: 10, score3: 30, score4: 40, score5: 15 },
    { name: "Content", score1: 8, score2: 15, score3: 35, score4: 30, score5: 12 },
    { name: "Feedback", score1: 10, score2: 20, score3: 40, score4: 20, score5: 10 },
    { name: "Organization", score1: 3, score2: 12, score3: 25, score4: 45, score5: 15 },
    { name: "Resources", score1: 7, score2: 15, score3: 30, score4: 35, score5: 13 },
  ]

  // Generate year comparison data from actual feedback data
  const generateYearComparisonData = useMemo(() => {
    if (!feedbackData.length) return { data: [], years: [] };
    
    // Group data by year and score
    const yearData = new Map<number, Map<number, number>>();
    
    feedbackData.forEach(item => {
      const date = new Date(item.created_on);
      const year = date.getFullYear();
      const score = Math.floor(item.score);
      
      if (!yearData.has(year)) {
        yearData.set(year, new Map<number, number>());
      }
      
      const scoreMap = yearData.get(year)!;
      const currentCount = scoreMap.get(score) || 0;
      scoreMap.set(score, currentCount + 1);
    });
    
    // Convert to the format needed for the chart
    // We need an array of {score: number, Year1: number, Year2: number, Year3: number}
    const years = Array.from(yearData.keys()).sort((a, b) => a - b).slice(-3); // Get last 3 years
    
    const result = [];
    for (let score = 1; score <= 5; score++) {
      const entry: any = { score };
      
      years.forEach((year, index) => {
        const yearKey = `Yr${index + 1}`;
        const scoreMap = yearData.get(year);
        const count = scoreMap ? (scoreMap.get(score) || 0) : 0;
        entry[yearKey] = count;
      });
      
      result.push(entry);
    }
    
    return { data: result, years };
  }, [feedbackData]);

  // Year comparison chart data
  const yearComparisonData = useMemo(() => {
    return generateYearComparisonData.data.length > 0 
      ? generateYearComparisonData.data 
      : [
        { score: 1, Yr1: 10, Yr2: 5, Yr3: 8 },
        { score: 2, Yr1: 15, Yr2: 20, Yr3: 12 },
        { score: 3, Yr1: 25, Yr2: 30, Yr3: 28 },
        { score: 4, Yr1: 12, Yr2: 15, Yr3: 18 },
        { score: 5, Yr1: 6, Yr2: 8, Yr3: 10 },
      ];
  }, [generateYearComparisonData]);

  // Year labels for the chart
  const yearLabels = useMemo(() => {
    return generateYearComparisonData.years.length > 0
      ? {
          Yr1: { label: generateYearComparisonData.years[0]?.toString() || "2023", color: "#73C173" },
          Yr2: { label: generateYearComparisonData.years[1]?.toString() || "2024", color: "#3A4DB9" },
          Yr3: { label: generateYearComparisonData.years[2]?.toString() || "2025", color: "#8B6BF2" },
        }
      : {
          Yr1: { label: "2023", color: "#73C173" },
          Yr2: { label: "2024", color: "#3A4DB9" },
          Yr3: { label: "2025", color: "#8B6BF2" },
        };
  }, [generateYearComparisonData]);

  // Generate class comparison data
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

  // First let's add a function to generate bar chart data for score distribution
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

  // Get current AI summary
  const getCurrentAISummary = () => {
    if (selectedHCs.length === 0) {
      return {
        pros: ["Select an HC/LO to see AI-generated insights"],
        cons: ["Select an HC/LO to see AI-generated insights"]
      };
    }

    const summary = aiSummaries.find(s => s.outcome_name === currentSummaryHC);
    if (!summary) {
      return {
        pros: ["No AI summary available for this HC/LO"],
        cons: ["No AI summary available for this HC/LO"]
      };
    }

    const pros = summary.strengths_text 
      ? summary.strengths_text
          .split('\n')
          .filter(Boolean)
          .map(text => text.replace(/^[-\s]+/, ''))
      : [];
    
    const cons = summary.improvement_text 
      ? summary.improvement_text
          .split('\n')
          .filter(Boolean)
          .map(text => text.replace(/^[-\s]+/, ''))
      : [];

    return { pros, cons };
  };

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
      
      {/* Add padding to the main content to account for the fixed header */}
      <div className="pt-[8.5rem]">
        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-6">
          {/* Filters section */}
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6 border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:text-[#38BDF8] hover:bg-[#1E293B]"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* HC/LO Type filter - updated to MultiSelect */}
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
                  
                  {/* Course filter - updated to MultiSelect */}
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
                  
                  {/* Term filter - updated to MultiSelect */}
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
                  
                  {/* Score Range filter - now in the fourth column */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5" />
                        Score Range
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number" 
                          min="1" 
                          max="5" 
                          value={minScore} 
                          onChange={handleMinScoreChange}
                          className="w-20 border-[#E2E8F0] focus:ring-[#38BDF8]" 
                        />
                        <span className="text-[#64748B]">to</span>
                        <Input 
                          type="number" 
                          min="1" 
                          max="5" 
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

          {/* Debug Section */}
          {(dbError || filteredData.length === 0) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="mb-6 border-none shadow-lg bg-red-50 overflow-hidden">
                <CardHeader className="bg-red-500 text-white p-4">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <AlertCircleIcon className="h-4 w-4" />
                    {filteredData.length === 0 ? "No Data Available" : "Database Error"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-red-800 whitespace-pre-line">{dbError || "No data found with current filters."}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={resetFilters} variant="outline" size="sm">
                      Reset Filters
                    </Button>
                  </div>
                  <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Troubleshooting:</strong> Follow setup steps in README to ensure backend is running.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Grade Legend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GradeLegend />
          </motion.div>

          

          {/* Content based on active tab */}
          {activeTab === "byHC" && (
            <div className="space-y-6">
              {/* First row: Summary Card (full width) */}
                <motion.div
                className="w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                {/* Summary Card content remains unchanged */}
                  <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold">
                          {selectedHCs.length === 1 
                            ? selectedHCs[0] 
                            : selectedHCs.length > 1 
                              ? `${selectedHCs.length} HCs/LOs Selected` 
                              : "All HCs/LOs"} 
                          - Average Score: {
                            selectedHCs.length === 1 
                              ? (filteredData
                                  .filter(item => item.outcome_name === selectedHCs[0])
                                  .reduce((sum, item) => sum + item.score, 0) / 
                                filteredData.filter(item => item.outcome_name === selectedHCs[0]).length).toFixed(1)
                              : (filteredData.reduce((sum, item) => sum + item.score, 0) / filteredData.length).toFixed(1)
                          }
                        </CardTitle>
                        <CardDescription className="text-[#94A3B8] mt-1">
                          Based on {filteredData.length} responses across {
                            new Set(filteredData.map(item => item.course_code)).size
                          } courses
                        </CardDescription>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" className="text-[#0F172A] border-[#0F172A] hover:text-white hover:border-white hover:bg-[#1E293B]"
                        onClick={() => window.open('https://my.minerva.edu/academics/hc-resources/hc-handbook/', '_blank')}>
                          HC Handbook
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                      </motion.div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedHCs.length > 1 && (
                          <div className="col-span-2 mb-4">
                            <p className="text-sm text-[#64748B] mb-2">Select which AI summary to display among the selected HC/LOs:</p>
                            <Select
                              value={currentSummaryHC}
                              onValueChange={setCurrentSummaryHC}
                            >
                              <SelectTrigger className="w-[400px]">
                                <SelectValue placeholder="Choose an HC/LO" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedHCs.map((hc) => (
                                  <SelectItem key={hc} value={hc} className="pr-8">
                                    {hc}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-[#73C173]" />
                            <h3 className="font-semibold text-[#0F172A]">Strengths:</h3>
                          </div>
                          <ul className="space-y-2">
                            {getCurrentAISummary().pros.map((item, index) => (
                              <motion.li
                                key={item}
                                className="flex items-start gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                              >
                                <div className="mt-1 rounded-full bg-[#73C173]/20 p-0.5">
                                  <Check className="h-3 w-3 text-[#73C173]" />
                                </div>
                                <span className="text-sm text-[#334155]">{item}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-[#E89A5D]" />
                            <h3 className="font-semibold text-[#0F172A]">Areas for Improvement:</h3>
                          </div>
                          <ul className="space-y-2">
                            {getCurrentAISummary().cons.map((item, index) => (
                              <motion.li
                                key={item}
                                className="flex items-start gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                              >
                                <div className="mt-1 rounded-full bg-[#E89A5D]/20 p-0.5">
                                  <AlertTriangle className="h-3 w-3 text-[#E89A5D]" />
                                </div>
                                <span className="text-sm text-[#334155]">{item}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

              {/* Second row: 2x2 grid of equal-sized chart cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score over time chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-none shadow-lg overflow-hidden h-[450px]">
                    <CardHeader className="p-4 border-b border-[#E2E8F0]">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-[#8B6BF2]" />
                          Scores over time
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Download CSV</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Download PNG</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 h-[380px]">
                      <ResponsiveContainer width="100%" height="100%">
                      {filteredData.length > 0 ? (
                        <LineChart 
                          data={timeSeriesData}
                          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis
                            dataKey="month"
                            stroke="#64748B"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: "#E2E8F0" }}
                          />
                          <YAxis
                            domain={[0, 5]}
                            stroke="#64748B"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: "#E2E8F0" }}
                            ticks={[1, 2, 3, 4, 5]}
                          />
                          <Tooltip
                            formatter={(value) => [`${value}`, 'Score']}
                            labelFormatter={(label) => `Month: ${label}`}
                            contentStyle={{ 
                              backgroundColor: "white", 
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                            }}
                          />
                          
                          {/* Solid fill area under the line */}
                          <Area
                            type="monotone"
                            dataKey="score"
                            fill="#8B6BF2"
                            fillOpacity={0.1}
                            stroke="none"
                          />
                          
                          {/* The main line - without legend */}
                          <Line
                            type="monotone"
                            dataKey="score"
                            name="Average Score"
                            stroke="#8B6BF2"
                            strokeWidth={3}
                            dot={{
                              fill: "#8B6BF2",
                              r: 5,
                              strokeWidth: 2,
                              stroke: "#FFFFFF"
                            }}
                            activeDot={{
                              fill: "#8B6BF2",
                              r: 7,
                              strokeWidth: 2,
                              stroke: "#FFFFFF"
                            }}
                          />
                          
                          {/* Reference lines for score levels */}
                          <ReferenceLine y={3} stroke="#64748B" strokeDasharray="3 3" />
                          </LineChart>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="text-center p-4">
                            <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                             <p className="text-sm text-gray-600">
                               No data available. Please ensure that you follow setup steps in README to ensure backend is running
                            </p>
                          </div>
                        </div>
                            )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Score Distribution bar chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Card className="border-none shadow-lg overflow-hidden h-[450px]">
                    <CardHeader className="p-4 border-b border-[#E2E8F0]">
                      <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-[#8B6BF2]" />
                        Score Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                        {filteredData.length > 0 ? (
                        <BarChart
                          data={generateScoreDistributionData}
                          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                          barGap={0}
                          barCategoryGap="30%"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis 
                            dataKey="score" 
                            fontSize={12}
                            tick={{ fill: "#64748B" }}
                            axisLine={{ stroke: "#E2E8F0" }}
                            tickLine={false}
                            label={{ value: 'Score', position: 'insideBottom', offset: -10, fill: '#64748B' }}
                          />
                          <YAxis
                            fontSize={12}
                            tick={{ fill: "#64748B" }}
                            axisLine={{ stroke: "#E2E8F0" }}
                            tickLine={false}
                            label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: -15, fill: '#64748B' }}
                          />
                          <Tooltip
                            formatter={(value) => [`${value}`, 'Frequency']}
                            labelFormatter={(label) => {
                              const scoreItem = generateScoreDistributionData.find(item => item.score === Number(label));
                              return scoreItem ? `${label} - ${scoreItem.name}` : label;
                            }}
                          />
                          <Bar 
                            dataKey="count" 
                            name="Frequency" 
                              isAnimationActive={animateCharts}
                            >
                            {generateScoreDistributionData.map((entry, index) => (
                                <Cell
                                key={`cell-${index}`} 
                                  fill={entry.color}
                                />
                              ))}
                          </Bar>
                          </BarChart>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="text-center p-4">
                            <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                             <p className="text-sm text-gray-600">
                             No data available. Please ensure that you follow setup steps in README to ensure backend is running
                             </p>
                          </div>
                        </div>
                            )}
                        </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* HC/LO Performance Radar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <Card className="border-none shadow-lg overflow-hidden h-[450px]">
                  <CardHeader className="p-4 border-b border-[#E2E8F0]">
                    <div className="flex items-center justify-between">
                    <CardTitle className="text-lgx font-semibold text-[#0F172A] flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#8B6BF2]" />
                      {showHCs ? "HC Performance Radar" : "LO Performance Radar"}
                    </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-[#334155] border-[#E2E8F0]"
                        onClick={() => setShowHCs(prev => !prev)}
                      >
                        {showHCs ? "Switch to LOs" : "Switch to HCs"}
                      </Button>
                    </div>
                  </CardHeader>
                    <CardContent className="p-4 h-[380px]">
                      {radarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          {filteredData.length > 0 ? (
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={filteredRadarData}>
                            <PolarGrid stroke="#E2E8F0" />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={(props) => {
                                const { payload, x, y, textAnchor } = props;
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
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#64748B", fontSize: 10 }} />
                            <Radar
                              name="Average Score"
                              dataKey="score"
                              stroke="#8B6BF2"
                              fill="#8B6BF2"
                              fillOpacity={0.6}
                              isAnimationActive={animateCharts}
                            />
                            <Tooltip 
                              formatter={(value) => [`${value}`, 'Score']} 
                              labelFormatter={(label) => `${label}`}
                            />
                          </RadarChart>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="text-center p-4">
                            <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                             <p className="text-sm text-gray-600">
                             No data available. Please ensure that you follow setup steps in README to ensure backend is running
                             </p>
                          </div>
                        </div>
                            )}
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-[#64748B] text-center">
                            No HC/LO data available
                          </p>
                      </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Class Comparison chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <Card className="border-none shadow-lg overflow-hidden h-[450px]">
                    <CardHeader className="p-4 border-b border-[#E2E8F0]">
                      <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-[#8B6BF2]" />
                          Class Comparison
                      </CardTitle>
                        <Select 
                          value={classComparisonHC || "All"} 
                          onValueChange={(value) => setClassComparisonHC(value === "All" ? "" : value)}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs border-[#E2E8F0] focus:ring-[#38BDF8]">
                            <SelectValue placeholder="Select HC/LO" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All HC/LOs</SelectItem>
                            {uniqueHCs.map(hc => (
                              <SelectItem key={hc} value={hc}>{hc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 h-[380px]">
                      {filteredData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={generateClassComparisonData} 
                            margin={{ top: 20, right: 30, left: 40, bottom: 75 }}
                            barSize={30}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis
                              dataKey="course" 
                              stroke="#64748B" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={{ stroke: "#E2E8F0" }}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                              interval={0}
                              label={{ value: 'Course', position: 'insideBottom', offset: -5, fill: '#64748B' }}
                            />
                            <YAxis 
                              domain={[0, 5]} 
                              ticks={[0, 1, 2, 3, 4, 5]} 
                              stroke="#64748B"
                              fontSize={12}
                              tickLine={false}
                              axisLine={{ stroke: "#E2E8F0" }}
                              label={{ 
                                value: 'Average Score', 
                                angle: -90, 
                                position: 'center', 
                                dx: -35, 
                                fill: '#64748B' 
                              }}
                            />
                            <Tooltip
                              formatter={(value) => [`${value}`, 'Average Score']}
                              labelFormatter={(label) => {
                                const course = generateClassComparisonData.find(item => item.course === label);
                                return course ? `${label} - ${course.courseTitle}` : label;
                              }}
                          />
                          <Bar
                              dataKey="averageScore"
                              name="Average Score" 
                              fill="#3A4DB9"
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={animateCharts}
                          />
                            <ReferenceLine 
                              y={generateClassComparisonData.length > 0 ? 
                                generateClassComparisonData.reduce((sum, item) => sum + item.averageScore, 0) / generateClassComparisonData.length : 0} 
                              stroke="#0F172A" 
                              strokeDasharray="3 3"
                              ifOverflow="extendDomain"
                          />
                        </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center p-4">
                            <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                             <p className="text-sm text-gray-600">
                             No data available. Please ensure that you follow setup steps in README to ensure backend is running
                             </p>
                          </div>
                          
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Feedback table remains below the charts, full width */}
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
                        {filteredData.reduce<Array<{ course_code: string; totalScore: number; count: number }>>((acc, item) => {
                          const existing = acc.find((row) => row.course_code === item.course_code);
                          if (existing) {
                            existing.totalScore += item.score;
                            existing.count += 1;
                          } else {
                            acc.push({ course_code: item.course_code, totalScore: item.score, count: 1 });
                          }
                          return acc;
                        }, []).map((row) => (
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
          )}

          {activeTab === "overall" && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4">
                  <CardTitle className="text-xl font-bold">Overall Performance</CardTitle>
                  <CardDescription className="text-[#94A3B8] mt-1">
                    Aggregated metrics across all categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <h2 className="text-4xl font-bold text-[#334155]">
                      {feedbackData.length > 0
                        ? (feedbackData.reduce((sum, item) => sum + item.score, 0) / feedbackData.length).toFixed(2)
                        : "N/A"}
                    </h2>
                    <p className="text-[#64748B]">Average score across all learning outcomes and courses</p>
                    
                    {/* Add Export All Data button here */}
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
                          <DropdownMenuItem onClick={() => window.open('http://localhost:5001/api/export-all', '_blank')}>
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
              
              {/* HC/LO Ranking Card */}
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
                    <RankingTable data={feedbackData} />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </main>
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
  )
}

function ScoreDisplay({ score }: { readonly score: number }): React.ReactElement {
  const getScoreStyle = (score: number) => {
    if (score >= 4.5) return { gradient: "from-[#9F7AFA] to-[#8B6BF2]", shadow: "rgba(139, 107, 242, 0.5)" };
    if (score >= 3.5) return { gradient: "from-[#4A5DC7] to-[#3A4DB9]", shadow: "rgba(58, 77, 185, 0.5)" };
    if (score >= 2.5) return { gradient: "from-[#85CF85] to-[#73C173]", shadow: "rgba(115, 193, 115, 0.5)" };
    if (score >= 1.5) return { gradient: "from-[#EAA56D] to-[#E89A5D]", shadow: "rgba(232, 154, 93, 0.5)" };
    return { gradient: "from-[#EA6D6D] to-[#E85D5D]", shadow: "rgba(232, 93, 93, 0.5)" };
  };

  const style = getScoreStyle(score);
  return (
    <div className="flex items-center">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 bg-gradient-to-br ${style.gradient}`}
        style={{ boxShadow: `0 8px 20px -4px ${style.shadow}` }}
      >
        <span className="font-bold text-white text-lg">{score}</span>
      </div>
    </div>
  );
}

function FeedbackTable({ data }: { readonly data: readonly FeedbackItem[] }): React.ReactElement {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc'); // 'desc' means newest first (default)
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const itemsPerPage = 10;
  
  // Sort data by date according to sort direction
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.created_on).getTime();
    const dateB = new Date(b.created_on).getTime();
    return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
  });
  
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle click on assignment title
  const handleAssignmentClick = (item: FeedbackItem) => {
    // In the future, this could navigate to an assignment page or open a modal with details
    // For now, we'll just show an alert with the assignment details
    alert(`Assignment: ${item.assignment_title}\nCourse: ${item.course_title}\n\nThis is a placeholder for future link functionality.`);
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    // Reset to first page when changing sort order
    setCurrentPage(1);
  };

  // Toggle comment expansion
  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Get current items from sorted data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Function to truncate comment text
  const truncateComment = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Function to check if a comment is long enough to be truncated
  const isCommentLong = (text: string, maxLength: number = 150) => {
    return text && text.length > maxLength;
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-end px-6 py-2 bg-white">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortDirection}
          className="text-[#334155] border-[#E2E8F0] text-xs flex items-center"
        >
          {sortDirection === 'desc' ? (
            <>
              <ArrowUpRight className="mr-1 h-3.5 w-3.5 rotate-180" />
              Newest First
            </>
          ) : (
            <>
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              Oldest First
            </>
          )}
        </Button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Score</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Outcome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Course</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Assignment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Weight</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Term</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
              <div className="flex items-center">
                Date
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Comments</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {currentItems.map((item) => {
            const commentId = `${item.course_code}-${item.created_on}-${item.outcome_name}`;
            const isExpanded = expandedComments[commentId] || false;
            const isLong = isCommentLong(item.comment);
            
            return (
              <tr key={`${item.course_code}-${item.created_on}`} className="hover:bg-[#F8FAFC]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <ScoreDisplay score={item.score} />
                </td>
                <td className="px-6 py-4 whitespace-normal text-[#334155] font-medium">
                  {item.outcome_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-[#0F172A]">{item.course_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-normal">
                  <div 
                    className="text-[#334155] hover:text-[#3A4DB9] hover:underline cursor-pointer flex items-center gap-1.5"
                    onClick={() => handleAssignmentClick(item)}
                  >
                    {item.assignment_title === "poll" ? (
                      // Use ClipboardList icon for polls
                      <ClipboardList className="h-3.5 w-3.5 flex-shrink-0 mt-[2px]" />
                    ) : item.assignment_title === "video" ? (
                      // Use Play icon for class recordings
                      <Play className="h-3.5 w-3.5 flex-shrink-0 mt-[2px]" />
                    ) : (
                      // Default to BookOpen for all other assignment types
                      <BookOpen className="h-3.5 w-3.5 flex-shrink-0 mt-[2px]" />
                    )}
                    {item.assignment_title === "poll"
                      ? "Poll"
                      : item.assignment_title === "video"
                      ? "Class Recording"
                      : item.assignment_title === "preclass_assignment"
                      ? "Pre-Class Work"
                      : item.assignment_title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#334155] font-medium">
                  {item.weight || "1x"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[#334155]">{item.term_title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-[#64748B] flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(item.created_on)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[#334155] max-w-md">
                    <div className={`${!isExpanded && isLong ? 'line-clamp-2' : ''} whitespace-pre-line`}>
                      {item.comment}
                    </div>
                    {isLong && (
                      <button 
                        onClick={() => toggleCommentExpansion(commentId)}
                        className="mt-1 text-xs font-medium text-[#3A4DB9] hover:text-[#8B6BF2] transition-colors duration-200"
                      >
                        {isExpanded ? "Show less" : "View more"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-6 py-3 border-t border-[#E2E8F0]">
          <div>
            <p className="text-sm text-[#64748B]">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastItem, sortedData.length)}</span> of{" "}
              <span className="font-medium">{sortedData.length}</span> entries
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate page numbers to show (always show current page and some neighbors)
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                  }
                  if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  }
                  pageNum = Math.max(1, Math.min(totalPages, pageNum));
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className={`w-9 h-9 p-0 ${currentPage === pageNum ? "bg-[#8B6BF2] text-white" : ""}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Now let's add the RankingTable component at the end of the file

function RankingTable({ data }: { readonly data: readonly FeedbackItem[] }): React.ReactElement {
  const [showType, setShowType] = useState<'HC' | 'LO' | 'All'>('All');
  const [sortAscending, setSortAscending] = useState<boolean>(true); // true = weakest first, false = strongest first
  
  // Generate a map of outcome_name to avg score and count
  const outcomeStats = useMemo(() => {
    const stats = new Map<string, { totalScore: number; count: number; isHC: boolean }>();
    
    data.forEach(item => {
      if (!item.outcome_name) return;
      
      if (!stats.has(item.outcome_name)) {
        // Determine if this is an HC (doesn't have a hyphen) or an LO (has a hyphen)
        const isHC = !item.outcome_name.includes('-');
        stats.set(item.outcome_name, { totalScore: 0, count: 0, isHC });
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
        avgScore: stats.count > 0 ? stats.totalScore / stats.count : 0,
        count: stats.count,
        isHC: stats.isHC
      }))
      .filter(outcome => {
        if (showType === 'All') return true;
        return showType === 'HC' ? outcome.isHC : !outcome.isHC;
      })
      .sort((a, b) => sortAscending ? 
        a.avgScore - b.avgScore : // weakest first (ascending)
        b.avgScore - a.avgScore   // strongest first (descending)
      );
  }, [outcomeStats, showType, sortAscending]);

  // Function to get color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 4.5) return "text-[#8B6BF2]"; // Excellent - Purple
    if (score >= 3.5) return "text-[#3A4DB9]"; // Good - Blue
    if (score >= 2.5) return "text-[#73C173]"; // Average - Green
    if (score >= 1.5) return "text-[#E89A5D]"; // Fair - Orange
    return "text-[#E85D5D]"; // Poor - Red
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortAscending(prev => !prev);
  };
  
  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-[#E2E8F0] gap-3">
        <h3 className="font-medium text-[#0F172A]">
          Showing {rankedOutcomes.length} {showType === 'All' ? 'outcomes' : showType === 'HC' ? 'outcomes' : 'outcomes'}
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Filter buttons */}
          <div className="flex space-x-2">
            <Button 
              variant={showType === 'All' ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowType('All')}
              className={showType === 'All' ? "bg-[#0F172A]" : ""}
            >
              All
            </Button>
            <Button 
              variant={showType === 'HC' ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowType('HC')}
              className={showType === 'HC' ? "bg-[#0F172A]" : ""}
            >
              HCs
            </Button>
            <Button 
              variant={showType === 'LO' ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowType('LO')}
              className={showType === 'LO' ? "bg-[#0F172A]" : ""}
            >
              LOs
            </Button>
          </div>
          
          {/* Sort order toggle button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSortOrder}
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
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">HC/LO</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[#64748B] uppercase tracking-wider">Average Score</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[#64748B] uppercase tracking-wider">Feedback Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rankedOutcomes.map((outcome, index) => (
            <tr 
              key={outcome.name} 
              className={`hover:bg-[#F8FAFC] ${sortAscending && index < 3 ? 'bg-red-50' : !sortAscending && index < 3 ? 'bg-green-50' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                {index + 1}
                {index === 0 && (
                  <span className="ml-2">
                    {sortAscending ? <span className="text-red-500">⬇️</span> : <span className="text-green-500">⬆️</span>}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 font-medium">
                <div className="flex items-center gap-2">
                  <span>{outcome.name}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    outcome.isHC ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {outcome.isHC ? 'HC' : 'LO'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                <span className={getScoreColorClass(outcome.avgScore)}>
                  {outcome.avgScore.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-[#64748B]">
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
  );
}
