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
  LogOut,
  Search,
  Filter,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
  Download,
  TrendingUp,
  Star,
  MessageSquare,
  Clock,
  Lightbulb,
  AlertCircle,
  Activity,
  Award,
  UserCheck,
} from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { GradeLegend } from "./grade-legend"
import { AnimatedScoreCard } from "./animated-score-card"

interface FeedbackItem {
  score: number;
  comment: string;
  outcome_name: string;
  assignment_title: string;
  course_title: string;
  course_code: string;
  term_title: string;
  created_on: string;
}

export default function FeedbackPlatform() {
  const [activeTab, setActiveTab] = useState<string>("byHC")
  const [animateCharts, setAnimateCharts] = useState(false)
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [filteredData, setFilteredData] = useState<FeedbackItem[]>([]);
  const [selectedHC, setSelectedHC] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [minScore, setMinScore] = useState<number>(1);
  const [maxScore, setMaxScore] = useState<number>(5);
  const [uniqueHCs, setUniqueHCs] = useState<string[]>([]);
  const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);
  const [uniqueTerms, setUniqueTerms] = useState<string[]>([]);
  const [dbError, setDbError] = useState<string>("");
  const [classComparisonHC, setClassComparisonHC] = useState<string>("");

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
        
        // Create combined course information (code + title)
        const coursesMap = new Map<string, string>();
        values.forEach((item: FeedbackItem) => {
          if (item.course_code && !coursesMap.has(item.course_code)) {
            coursesMap.set(item.course_code, `${item.course_code} - ${item.course_title}`);
          }
        });
        const courses = Array.from(coursesMap.keys());
        
        const terms = [...new Set(values.map((item: FeedbackItem) => item.term_title))].filter(Boolean);

        console.log("Unique HCs/LOs:", hcs);
        console.log("Unique Courses:", courses);
        console.log("Unique Terms:", terms);

        setUniqueHCs(hcs);
        setUniqueCourses(courses);
        setUniqueTerms(terms);
        setFeedbackData(values);
        setFilteredData(values);

        // Also update pie chart data based on actual scores
        updatePieChartData(values);
        
        // Clear any previous errors
        setDbError("");
      } catch (error) {
        console.error("Error loading data from API:", error);
        setDbError(`Error loading data: ${String(error)}`);
        
        // FALLBACK: Use mock data since we couldn't load from API
        console.log("Loading mock data as fallback...");
        const mockData: FeedbackItem[] = [
          {
            score: 4,
            comment: "The student demonstrated strong engagement with the material.",
            outcome_name: "Professionalism",
            assignment_title: "Final Project",
            course_title: "Computer Science Fundamentals",
            course_code: "CS101",
            term_title: "Spring 2023",
            created_on: "2023-05-15"
          },
          {
            score: 3,
            comment: "Good work, but could improve organization.",
            outcome_name: "Communication",
            assignment_title: "Midterm Presentation",
            course_title: "Data Structures",
            course_code: "CS162",
            term_title: "Fall 2023",
            created_on: "2023-11-10"
          },
          {
            score: 5,
            comment: "Excellent analysis and critical thinking skills.",
            outcome_name: "ProblemSolving",
            assignment_title: "Case Study",
            course_title: "Algorithm Design",
            course_code: "CS250",
            term_title: "Winter 2024",
            created_on: "2024-02-20"
          },
          {
            score: 2,
            comment: "Needs more attention to detail in implementation.",
            outcome_name: "TechnicalCompetence",
            assignment_title: "Coding Assignment",
            course_title: "Web Development",
            course_code: "CS330",
            term_title: "Spring 2024",
            created_on: "2024-04-05"
          },
          {
            score: 4,
            comment: "Shows good teamwork and collaborative skills.",
            outcome_name: "Teamwork",
            assignment_title: "Group Project",
            course_title: "Software Engineering",
            course_code: "CS401",
            term_title: "Fall 2024",
            created_on: "2024-10-15"
          }
        ];
        
        // Extract unique values for filters from mock data
        const hcs = [...new Set(mockData.map(item => item.outcome_name))];
        
        // Create combined course information for mock data
        const coursesMap = new Map<string, string>();
        mockData.forEach((item) => {
          if (item.course_code && !coursesMap.has(item.course_code)) {
            coursesMap.set(item.course_code, `${item.course_code} - ${item.course_title}`);
          }
        });
        const courses = Array.from(coursesMap.keys());
        
        const terms = [...new Set(mockData.map(item => item.term_title))];
        
        console.log("Using mock data with:");
        console.log("Unique HCs/LOs:", hcs);
        console.log("Unique Courses:", courses);
        console.log("Unique Terms:", terms);
        
        setUniqueHCs(hcs);
        setUniqueCourses(courses);
        setUniqueTerms(terms);
        setFeedbackData(mockData);
        setFilteredData(mockData);
        
        // Update pie chart data based on mock data
        updatePieChartData(mockData);
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

  // Function to check for SQLite files
  const checkSqliteFiles = async () => {
    // Try different paths where WASM and DB might be located
    const wasmPaths = [
      './sql-wasm.wasm',
      '/sql-wasm.wasm',
      '../sql-wasm.wasm',
      '/public/sql-wasm.wasm',
      './public/sql-wasm.wasm'
    ];
    
    const dbPaths = [
      './data.db',
      '/data.db',
      '../data.db',
      '/public/data.db',
      './public/data.db'
    ];
    
    const wasmResults = await Promise.all(wasmPaths.map(async path => ({
      path,
      exists: await checkFileExists(path)
    })));
    
    const dbResults = await Promise.all(dbPaths.map(async path => ({
      path,
      exists: await checkFileExists(path)
    })));
    
    console.log('WASM file check results:', wasmResults);
    console.log('DB file check results:', dbResults);
    
    const workingWasmPath = wasmResults.find(result => result.exists)?.path;
    const workingDbPath = dbResults.find(result => result.exists)?.path;
    
    if (workingWasmPath && workingDbPath) {
      setDbError(`Files found at:\nWASM: ${workingWasmPath}\nDB: ${workingDbPath}\nTry using these paths.`);
    } else {
      const wasmStatus = wasmResults.map(r => r.path + ': ' + (r.exists ? '✓' : '✗')).join(', ');
      const dbStatus = dbResults.map(r => r.path + ': ' + (r.exists ? '✓' : '✗')).join(', ');
      setDbError('Files not found. Check that sql-wasm.wasm and data.db are in the correct location.\n' +
        'WASM: ' + wasmStatus + '\n' +
        'DB: ' + dbStatus);
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

    if (selectedHC) {
      filtered = filtered.filter(item => item.outcome_name === selectedHC);
    }
    if (selectedCourse) {
      filtered = filtered.filter(item => item.course_code === selectedCourse);
    }
    if (selectedTerm) {
      filtered = filtered.filter(item => item.term_title === selectedTerm);
    }
    filtered = filtered.filter(item => item.score >= minScore && item.score <= maxScore);
    
    console.log("Filtering applied:", {
      selectedHC,
      selectedCourse,
      selectedTerm,
      minScore,
      maxScore
    });
    console.log("Filtered data count:", filtered.length);
    
    setFilteredData(filtered);
    
    // Also update pie chart when filters change
    updatePieChartData(filtered);
  }, [feedbackData, selectedHC, selectedCourse, selectedTerm, minScore, maxScore]);

  // Trigger animations after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCharts(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

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

  // AI-generated summary (simulated)
  const aiSummary = {
    pros: [
      "Clear explanations during lectures",
      "Well-organized course materials",
      "Helpful examples and applications",
      "Responsive to student questions",
    ],
    cons: [
      "Assignment instructions sometimes unclear",
      "Feedback timing could be improved",
      "Some concepts need more detailed explanations",
      "More practice problems would be helpful",
    ],
  }

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

  // Calculate metrics for cards based on actual data
  const calculateMetrics = useMemo(() => {
    if (!feedbackData.length) return null;
    
    // Calculate average score
    const totalScore = feedbackData.reduce((sum, item) => sum + item.score, 0);
    const avgScore = (totalScore / feedbackData.length).toFixed(1);
    
    // Count unique outcome names as a proxy for "Response Rate"
    const uniqueOutcomes = new Set(feedbackData.map(item => item.outcome_name)).size;
    const responseRate = Math.min(100, Math.round((uniqueOutcomes / 6) * 100)); // Assuming 6 total possible outcomes
    
    // Use the count of items as a proxy for "Completion Time"
    // Lower count = faster completion (for demonstration purposes)
    const completionTime = Math.max(5, Math.min(20, Math.round(30 - feedbackData.length / 10)));
    
    return {
      avgScore,
      responseRate,
      completionTime
    };
  }, [feedbackData]);

  // Trend indicators
  const trendData = useMemo(() => [
    { 
      metric: "Average Score", 
      value: calculateMetrics ? calculateMetrics.avgScore : "3.2", 
      change: "+0.3", 
      trend: "up", 
      icon: <Award /> 
    },
    { 
      metric: "Response Rate", 
      value: calculateMetrics ? `${calculateMetrics.responseRate}%` : "78%", 
      change: "+5%", 
      trend: "up", 
      icon: <UserCheck /> 
    },
    { 
      metric: "Completion Time", 
      value: calculateMetrics ? `${calculateMetrics.completionTime} min` : "12 min", 
      change: "-2 min", 
      trend: "down", 
      icon: <Clock /> 
    },
  ], [calculateMetrics]);

  // Score distribution by category
  const scoreDistributionData = [
    { name: "Clarity", score1: 5, score2: 10, score3: 30, score4: 40, score5: 15 },
    { name: "Content", score1: 8, score2: 15, score3: 35, score4: 30, score5: 12 },
    { name: "Feedback", score1: 10, score2: 20, score3: 40, score4: 20, score5: 10 },
    { name: "Organization", score1: 3, score2: 12, score3: 25, score4: 45, score5: 15 },
    { name: "Resources", score1: 7, score2: 15, score3: 30, score4: 35, score5: 13 },
  ]

  // Add reset filters functionality
  const resetFilters = () => {
    setSelectedHC("");
    setSelectedCourse("");
    setSelectedTerm("");
    setMinScore(1);
    setMaxScore(5);
    // Reset the filtered data to show all data
    setFilteredData(feedbackData);
    
    // Also update pie chart with all data
    updatePieChartData(feedbackData);
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Header with navigation tabs */}
      <header className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div
              className="bg-[#38BDF8] rounded-lg p-2"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <GraduationCap className="h-6 w-6 text-[#0F172A]" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight">Academic Feedback Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div
              className="hidden md:flex items-center gap-2 bg-[#334155] rounded-full px-3 py-1.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Search className="h-4 w-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none text-sm focus:outline-none text-white placeholder:text-[#94A3B8] w-32"
              />
            </motion.div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="flex items-center justify-center rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="h-8 w-8 border-2 border-[#38BDF8]">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback className="bg-[#334155]">JD</AvatarFallback>
                  </Avatar>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="byHC" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b border-[#334155] w-full justify-start rounded-none h-auto p-0 mb-0">
              {["byHC", "byLO", "byCourse", "overall"].map((tab, index) => (
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TabsTrigger
                    value={tab}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#38BDF8] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 text-white data-[state=active]:text-[#38BDF8]"
                  >
                    {getTabLabel(tab)}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        {/* Filters section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
                {/* HC/LO Type filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    HC/LO Type
                  </label>
                  <Select defaultValue="All" onValueChange={(value) => setSelectedHC(value === "All" ? "" : value)}>
                    <SelectTrigger className="w-full border-[#E2E8F0] focus:ring-[#38BDF8]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      {uniqueHCs.map(hc => (
                        <SelectItem key={hc} value={hc}>{hc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Course filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Course
                  </label>
                  <Select defaultValue="All" onValueChange={(value) => setSelectedCourse(value === "All" ? "" : value)}>
                    <SelectTrigger className="w-full border-[#E2E8F0] focus:ring-[#38BDF8]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Courses</SelectItem>
                      {uniqueCourses.map(courseCode => {
                        // Find the course title for this code
                        const courseItem = feedbackData.find(item => item.course_code === courseCode);
                        const displayText = courseItem ? 
                          `${courseCode} - ${courseItem.course_title}` : 
                          courseCode;
                        return (
                          <SelectItem key={courseCode} value={courseCode}>
                            {displayText}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Term filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Term
                  </label>
                  <Select defaultValue="All" onValueChange={(value) => setSelectedTerm(value === "All" ? "" : value)}>
                    <SelectTrigger className="w-full border-[#E2E8F0] focus:ring-[#38BDF8]">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Terms</SelectItem>
                      {uniqueTerms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <AlertCircle className="h-4 w-4" />
                  {filteredData.length === 0 ? "No Data Available" : "Database Error"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-red-800 whitespace-pre-line">{dbError || "No data found with current filters."}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={checkSqliteFiles} variant="outline" size="sm">
                    Check SQLite Files
                  </Button>
                  <Button onClick={resetFilters} variant="outline" size="sm">
                    Reset Filters
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Troubleshooting:</strong> Make sure the <code>sql-wasm.wasm</code> file and <code>data.db</code> files 
                    are in the correct location (typically in the <code>public</code> folder). If the database is not loading,
                    the platform is showing sample data instead.
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

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {trendData.map((item, index) => (
            <motion.div
              key={item.metric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <AnimatedScoreCard
                score={(Number.parseFloat(item.value.replace("%", "")) / 100) * 5 || Number.parseFloat(item.value)}
                title={item.metric}
                subtitle={`${item.change} from previous period`}
                icon={item.icon}
              />
            </motion.div>
          ))}
        </div>

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
                      {selectedHC || "All HCs/LOs"} - Average Score: {
                        selectedHC 
                          ? (filteredData
                              .filter(item => item.outcome_name === selectedHC)
                              .reduce((sum, item) => sum + item.score, 0) / 
                            filteredData.filter(item => item.outcome_name === selectedHC).length).toFixed(1)
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
                    <Button variant="outline" size="sm" className="text-white border-white hover:bg-[#1E293B]">
                      HC Handbook
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </motion.div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-[#73C173]" />
                        <h3 className="font-semibold text-[#0F172A]">Strengths:</h3>
                      </div>
                      <ul className="space-y-2">
                        {aiSummary.pros.map((item, index) => (
                          <motion.li
                            key={item}
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <div className="mt-1 rounded-full bg-[#73C173]/20 p-0.5 shadow-[0_0_8px_rgba(115,193,115,0.5)]">
                              <Check className="h-3 w-3 text-[#73C173]" />
                            </div>
                            <span className="text-sm text-[#334155]">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-[#E89A5D]" />
                        <h3 className="font-semibold text-[#0F172A]">Areas for Improvement:</h3>
                      </div>
                      <ul className="space-y-2">
                        {aiSummary.cons.map((item, index) => (
                          <motion.li
                            key={item}
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <div className="mt-1 rounded-full bg-[#E89A5D]/20 p-0.5 shadow-[0_0_8px_rgba(232,154,93,0.5)]">
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
                <Card className="border-none shadow-lg overflow-hidden h-[400px]">
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
                  <CardContent className="p-4 h-[330px]">
                    <ChartContainer config={{ score: { label: "Score", color: "#8B6BF2" } }} className="h-full">
                      <LineChart data={timeSeriesData} margin={{ top: 15, right: 15, left: 15, bottom: 15 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B6BF2" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8B6BF2" stopOpacity={0} />
                          </linearGradient>
                          <filter id="shadow" x="-2" y="-2" width="104%" height="104%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8B6BF2" floodOpacity="0.3" />
                          </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="month"
                          stroke="#64748B"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#E2E8F0" }}
                          label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#64748B' }}
                        />
                        <YAxis
                          domain={[1, 5]}
                          stroke="#64748B"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#E2E8F0" }}
                          ticks={[1, 2, 3, 4, 5]}
                          label={{ value: 'Score', angle: -90, position: 'insideLeft', offset: -10, fill: '#64748B' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#8B6BF2"
                          strokeWidth={3}
                          activeDot={{ r: 8, fill: "#0F172A", stroke: "#8B6BF2", strokeWidth: 2 }}
                          dot={{ r: 4, fill: "#8B6BF2", stroke: "#0F172A", strokeWidth: 2 }}
                          filter="url(#shadow)"
                          connectNulls={true}
                          isAnimationActive={false}
                          name="Average Score"
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          fill="url(#colorScore)"
                          stroke="none"
                          fillOpacity={0.3}
                          isAnimationActive={animateCharts}
                          name="Score Range"
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Score Distribution bar chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="border-none shadow-lg overflow-hidden h-[400px]">
                  <CardHeader className="p-4 border-b border-[#E2E8F0]">
                    <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-[#8B6BF2]" />
                      Score Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-[330px]">
                    <ResponsiveContainer width="100%" height="100%">
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
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* HC/LO Performance Radar */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card className="border-none shadow-lg overflow-hidden h-[400px]">
                  <CardHeader className="p-4 border-b border-[#E2E8F0]">
                    <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#8B6BF2]" />
                      HC/LO Performance Radar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-[330px]">
                    {radarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#E2E8F0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 12 }} />
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
                            labelFormatter={(label) => `HC/LO: ${label}`}
                          />
                        </RadarChart>
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
                <Card className="border-none shadow-lg overflow-hidden h-[400px]">
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
                  <CardContent className="p-4 h-[330px]">
                    {generateClassComparisonData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={generateClassComparisonData} 
                          margin={{ top: 20, right: 20, left: 30, bottom: 75 }}
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
                            label={{ value: 'Average Score', angle: -90, position: 'insideLeft', offset: -15, fill: '#64748B' }}
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
                        <p className="text-[#64748B]">No data available</p>
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
                    <Button variant="outline" size="sm" className="text-[#334155] border-[#E2E8F0]">
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
                    <Button variant="outline" size="sm" className="text-[#334155] border-[#E2E8F0]">
                      <Download className="mr-2 h-4 w-4" />
                      Export All Data
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        )}

        {activeTab === "byLO" && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4">
                <CardTitle className="text-xl font-bold">Learning Outcomes Analysis</CardTitle>
                <CardDescription className="text-[#94A3B8] mt-1">
                  Analyze student performance against learning objectives
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                          Learning Outcome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                          Average Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {filteredData.reduce<Array<{ outcome_name: string; totalScore: number; count: number }>>((acc, item) => {
                        const existing = acc.find((row) => row.outcome_name === item.outcome_name);
                        if (existing) {
                          existing.totalScore += item.score;
                          existing.count += 1;
                        } else {
                          acc.push({ outcome_name: item.outcome_name, totalScore: item.score, count: 1 });
                        }
                        return acc;
                      }, []).map((row) => (
                        <tr key={row.outcome_name} className="hover:bg-[#F8FAFC]">
                          <td className="px-6 py-4 whitespace-nowrap text-[#334155] font-medium">
                            {row.outcome_name}
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
                    {filteredData.length > 0
                      ? (filteredData.reduce((sum, item) => sum + item.score, 0) / filteredData.length).toFixed(2)
                      : "N/A"}
                  </h2>
                  <p className="text-[#64748B]">Average score across all learning outcomes and courses</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-[#8B6BF2] rounded-lg p-1.5">
                <GraduationCap className="h-4 w-4 text-[#0F172A]" />
              </div>
              <span className="font-semibold">Academic Feedback Platform</span>
            </div>
            <div className="text-sm text-[#94A3B8]">© 2025 Academic Feedback Platform. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Missing components
function Settings({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PieChartIcon({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  )
}

function BarChart2({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  )
}

function Check({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function AlertTriangle({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function MoreVertical({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}

function TrendingDown({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  )
}

function ChevronLeft({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function getTabLabel(tab: string): string {
  switch (tab) {
    case "byHC": return "By HC";
    case "byLO": return "By LO";
    case "byCourse": return "By Course";
    default: return "Overall";
  }
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
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Score</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Course</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Term</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">Comments</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {currentItems.map((item) => (
            <tr key={`${item.course_code}-${item.created_on}`} className="hover:bg-[#F8FAFC]">
              <td className="px-6 py-4 whitespace-nowrap">
                <ScoreDisplay score={item.score} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-[#0F172A]">{item.course_code}</div>
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
                <div className="text-sm text-[#334155] max-w-md">{item.comment}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-6 py-3 border-t border-[#E2E8F0]">
          <div>
            <p className="text-sm text-[#64748B]">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastItem, data.length)}</span> of{" "}
              <span className="font-medium">{data.length}</span> entries
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

