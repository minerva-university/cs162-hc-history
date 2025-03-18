"use client"

import { useState, useEffect } from "react"
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
 * - By HC (Higher Criteria)
 * - By LO (Learning Outcomes)
 * - By Course
 * - Overall performance
 * 
 * It uses mock data for demonstration purposes but is designed to connect
 * to a real data source in production.
 */

export default function FeedbackPlatform() {
  // Mock data for demonstration
  const [activeTab, setActiveTab] = useState("byHC")
  const [animateCharts, setAnimateCharts] = useState(false)

  // Trigger animations after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCharts(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Sample time series data
  const timeSeriesData = [
    { month: "Jan", score: 2.1 },
    { month: "Feb", score: 2.4 },
    { month: "Mar", score: 2.2 },
    { month: "Apr", score: 2.6 },
    { month: "May", score: 3.1 },
    { month: "Jun", score: 3.2 },
    { month: "Jul", score: 3.0 },
    { month: "Aug", score: 3.1 },
    { month: "Sep", score: 3.2 },
  ]

  // Sample distribution data for HC scores
  const hcScoreData = [
    { score: 1, Yr1: 10, Yr2: 5, Yr3: 8 },
    { score: 2, Yr1: 15, Yr2: 20, Yr3: 12 },
    { score: 3, Yr1: 25, Yr2: 30, Yr3: 28 },
    { score: 4, Yr1: 12, Yr2: 15, Yr3: 18 },
    { score: 5, Yr1: 6, Yr2: 8, Yr3: 10 },
  ]

  // Sample feedback data
  const feedbackData = [
    {
      score: 4.7,
      course: "CS101",
      prof: "Smith",
      date: "2025-01-05",
      comment: "Good organization but could improve clarity on assignments.",
    },
    {
      score: 2.8,
      course: "MATH202",
      prof: "Johnson",
      date: "2025-01-12",
      comment: "Lectures were difficult to follow, examples helped though.",
    },
    {
      score: 4.2,
      course: "PHYS105",
      prof: "Williams",
      date: "2025-01-20",
      comment: "Excellent explanations and helpful office hours.",
    },
    {
      score: 3.0,
      course: "ENG210",
      prof: "Davis",
      date: "2025-01-25",
      comment: "Feedback was detailed but took too long to receive.",
    },
    {
      score: 3.7,
      course: "CHEM110",
      prof: "Miller",
      date: "2025-02-02",
      comment: "Well-structured course with good lab integration.",
    },
    {
      score: 1.7,
      course: "HIST150",
      prof: "Brown",
      date: "2025-02-10",
      comment: "Interesting content but assessment criteria were unclear.",
    },
    {
      score: 4.5,
      course: "BIO220",
      prof: "Wilson",
      date: "2025-02-15",
      comment: "Great examples and well-paced lectures.",
    },
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

  // Radar chart data
  const radarData = [
    { subject: "Organization", A: 4.2, B: 3.8, fullMark: 5 },
    { subject: "Clarity", A: 3.8, B: 3.2, fullMark: 5 },
    { subject: "Helpfulness", A: 4.5, B: 4.0, fullMark: 5 },
    { subject: "Feedback", A: 3.2, B: 3.5, fullMark: 5 },
    { subject: "Engagement", A: 4.0, B: 3.7, fullMark: 5 },
    { subject: "Resources", A: 3.9, B: 3.4, fullMark: 5 },
  ]

  // Pie chart data
  const pieData = [
    { name: "Excellent (5)", value: 25, color: "#8B6BF2" },
    { name: "Good (4)", value: 35, color: "#3A4DB9" },
    { name: "Average (3)", value: 20, color: "#73C173" },
    { name: "Fair (2)", value: 15, color: "#E89A5D" },
    { name: "Poor (1)", value: 5, color: "#E85D5D" },
  ]

  // Trend indicators
  const trendData = [
    { metric: "Average Score", value: "3.2", change: "+0.3", trend: "up", icon: <Award /> },
    { metric: "Response Rate", value: "78%", change: "+5%", trend: "up", icon: <UserCheck /> },
    { metric: "Completion Time", value: "12 min", change: "-2 min", trend: "down", icon: <Clock /> },
  ]

  // Score distribution by category
  const scoreDistributionData = [
    { name: "Clarity", score1: 5, score2: 10, score3: 30, score4: 40, score5: 15 },
    { name: "Content", score1: 8, score2: 15, score3: 35, score4: 30, score5: 12 },
    { name: "Feedback", score1: 10, score2: 20, score3: 40, score4: 20, score5: 10 },
    { name: "Organization", score1: 3, score2: 12, score3: 25, score4: 45, score5: 15 },
    { name: "Resources", score1: 7, score2: 15, score3: 30, score4: 35, score5: 13 },
  ]

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
                    {tab === "byHC" ? "By HC" : tab === "byLO" ? "By LO" : tab === "byCourse" ? "By Course" : "Overall"}
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
                <Button variant="ghost" size="sm" className="text-white hover:text-[#38BDF8] hover:bg-[#1E293B]">
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    HC/LO Type
                  </label>
                  <Select defaultValue="Organization">
                    <SelectTrigger className="w-full border-[#E2E8F0] focus:ring-[#38BDF8]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Organization">Organization</SelectItem>
                      <SelectItem value="Clarity">Clarity</SelectItem>
                      <SelectItem value="Helpfulness">Helpfulness</SelectItem>
                      <SelectItem value="Feedback">Feedback Quality</SelectItem>
                      <SelectItem value="Overall">Overall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Course
                  </label>
                  <Select defaultValue="All">
                    <SelectTrigger className="w-full border-[#E2E8F0] focus:ring-[#38BDF8]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Courses</SelectItem>
                      <SelectItem value="CS101">CS101</SelectItem>
                      <SelectItem value="MATH202">MATH202</SelectItem>
                      <SelectItem value="PHYS105">PHYS105</SelectItem>
                      <SelectItem value="ENG210">ENG210</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Professor
                  </label>
                  <Select defaultValue="All">
                    <SelectTrigger className="w-full border-[#E2E8F0] focus:ring-[#38BDF8]">
                      <SelectValue placeholder="Select professor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Professors</SelectItem>
                      <SelectItem value="Smith">Smith</SelectItem>
                      <SelectItem value="Johnson">Johnson</SelectItem>
                      <SelectItem value="Williams">Williams</SelectItem>
                      <SelectItem value="Davis">Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Year
                  </label>
                  <Select defaultValue="2025">
                    <SelectTrigger className="w-full border-[#E2E8F0] focus:ring-[#38BDF8]">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Years</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Major
                  </label>
                  <Select defaultValue="All">
                    <SelectTrigger className="w-full border-[#E2E8F0] focus:ring-[#38BDF8]">
                      <SelectValue placeholder="Select major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Majors</SelectItem>
                      <SelectItem value="CS">Computer Science</SelectItem>
                      <SelectItem value="Math">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      defaultValue="1"
                      className="w-20 border-[#E2E8F0] focus:ring-[#38BDF8]"
                    />
                    <span className="text-[#64748B]">to</span>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      defaultValue="5"
                      className="w-20 border-[#E2E8F0] focus:ring-[#38BDF8]"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-[#38BDF8] hover:bg-[#0EA5E9] text-white shadow-lg">Apply Filters</Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grade Legend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GradeLegend />
        </motion.div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {trendData.map((item, index) => (
            <motion.div
              key={index}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Summary Card */}
              <motion.div
                className="col-span-1 md:col-span-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-[#0F172A] to-[#334155] text-white p-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">Organization - Average Score: 3.2</CardTitle>
                      <CardDescription className="text-[#94A3B8] mt-1">
                        Based on 245 responses across 12 courses
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
                              key={index}
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
                              key={index}
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

              {/* Score over time chart */}
              <motion.div
                className="col-span-1 md:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-none shadow-lg overflow-hidden">
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
                  <CardContent className="p-6">
                    <ChartContainer
                      config={{
                        score: {
                          label: "Score",
                          color: "#8B6BF2",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <LineChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                        />
                        <YAxis
                          domain={[1, 5]}
                          stroke="#64748B"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#E2E8F0" }}
                          ticks={[1, 2, 3, 4, 5]}
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
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          fill="url(#colorScore)"
                          stroke="none"
                          fillOpacity={0.3}
                          isAnimationActive={animateCharts}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* HC Score distribution */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardHeader className="p-4 border-b border-[#E2E8F0]">
                    <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4 text-[#8B6BF2]" />
                      Score Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            isAnimationActive={animateCharts}
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                filter={`drop-shadow(0px 4px 8px ${entry.color}80)`}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Radar chart and year comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardHeader className="p-4 border-b border-[#E2E8F0]">
                    <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#8B6BF2]" />
                      Criteria Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#E2E8F0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#64748B", fontSize: 10 }} />
                          <Radar
                            name="2024"
                            dataKey="A"
                            stroke="#8B6BF2"
                            fill="#8B6BF2"
                            fillOpacity={0.6}
                            isAnimationActive={animateCharts}
                          />
                          <Radar
                            name="2023"
                            dataKey="B"
                            stroke="#3A4DB9"
                            fill="#3A4DB9"
                            fillOpacity={0.6}
                            isAnimationActive={animateCharts}
                          />
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardHeader className="p-4 border-b border-[#E2E8F0]">
                    <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-[#8B6BF2]" />
                      Year Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ChartContainer
                      config={{
                        Yr1: {
                          label: "2023",
                          color: "#73C173",
                        },
                        Yr2: {
                          label: "2024",
                          color: "#3A4DB9",
                        },
                        Yr3: {
                          label: "2025",
                          color: "#8B6BF2",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <BarChart data={hcScoreData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <filter id="shadow-bar" x="-2" y="-2" width="104%" height="104%">
                            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.1" />
                          </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis
                          dataKey="score"
                          stroke="#64748B"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#E2E8F0" }}
                        />
                        <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={{ stroke: "#E2E8F0" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="Yr1"
                          radius={[4, 4, 0, 0]}
                          filter="url(#shadow-bar)"
                          isAnimationActive={animateCharts}
                        />
                        <Bar
                          dataKey="Yr2"
                          radius={[4, 4, 0, 0]}
                          filter="url(#shadow-bar)"
                          isAnimationActive={animateCharts}
                        />
                        <Bar
                          dataKey="Yr3"
                          radius={[4, 4, 0, 0]}
                          filter="url(#shadow-bar)"
                          isAnimationActive={animateCharts}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* All scores table */}
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                            Professor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                            Comments
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {feedbackData.map((item, index) => (
                          <tr key={index} className="hover:bg-[#F8FAFC]">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 ${
                                    item.score >= 4.5
                                      ? "bg-gradient-to-br from-[#9F7AFA] to-[#8B6BF2]"
                                      : item.score >= 3.5
                                        ? "bg-gradient-to-br from-[#4A5DC7] to-[#3A4DB9]"
                                        : item.score >= 2.5
                                          ? "bg-gradient-to-br from-[#85CF85] to-[#73C173]"
                                          : item.score >= 1.5
                                            ? "bg-gradient-to-br from-[#EAA56D] to-[#E89A5D]"
                                            : "bg-gradient-to-br from-[#EA6D6D] to-[#E85D5D]"
                                  }`}
                                  style={{
                                    boxShadow:
                                      item.score >= 4.5
                                        ? "0 8px 20px -4px rgba(139, 107, 242, 0.5)"
                                        : item.score >= 3.5
                                          ? "0 8px 20px -4px rgba(58, 77, 185, 0.5)"
                                          : item.score >= 2.5
                                            ? "0 8px 20px -4px rgba(115, 193, 115, 0.5)"
                                            : item.score >= 1.5
                                              ? "0 8px 20px -4px rgba(232, 154, 93, 0.5)"
                                              : "0 8px 20px -4px rgba(232, 93, 93, 0.5)",
                                  }}
                                >
                                  <span className="font-bold text-white text-lg">{item.score}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-[#0F172A]">{item.course}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-[#334155]">{item.prof}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-[#64748B] flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(item.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#334155] max-w-md">{item.comment}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="p-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div className="text-sm text-[#64748B]">
                    Showing <span className="font-medium">7</span> of <span className="font-medium">120</span> entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 bg-[#8B6BF2] text-white border-[#8B6BF2]"
                    >
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      3
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Score distribution by category */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <Card className="border-none shadow-lg overflow-hidden mt-6">
                <CardHeader className="p-4 border-b border-[#E2E8F0]">
                  <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-[#8B6BF2]" />
                    Score Distribution by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={scoreDistributionData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        barGap={0}
                        barCategoryGap="15%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="name"
                          fontSize={12}
                          tick={{ fill: "#64748B" }}
                          axisLine={{ stroke: "#E2E8F0" }}
                          tickLine={false}
                        />
                        <YAxis
                          fontSize={12}
                          tick={{ fill: "#64748B" }}
                          axisLine={{ stroke: "#E2E8F0" }}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="score5"
                          name="Excellent (5)"
                          stackId="a"
                          fill="#8B6BF2"
                          radius={[0, 0, 0, 0]}
                          isAnimationActive={animateCharts}
                        />
                        <Bar
                          dataKey="score4"
                          name="Good (4)"
                          stackId="a"
                          fill="#3A4DB9"
                          radius={[0, 0, 0, 0]}
                          isAnimationActive={animateCharts}
                        />
                        <Bar
                          dataKey="score3"
                          name="Average (3)"
                          stackId="a"
                          fill="#73C173"
                          radius={[0, 0, 0, 0]}
                          isAnimationActive={animateCharts}
                        />
                        <Bar
                          dataKey="score2"
                          name="Fair (2)"
                          stackId="a"
                          fill="#E89A5D"
                          radius={[0, 0, 0, 0]}
                          isAnimationActive={animateCharts}
                        />
                        <Bar
                          dataKey="score1"
                          name="Poor (1)"
                          stackId="a"
                          fill="#E85D5D"
                          radius={[0, 0, 0, 0]}
                          isAnimationActive={animateCharts}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
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
                <div className="flex items-center justify-center h-64">
                  <p className="text-[#64748B]">Learning Outcomes view content would appear here...</p>
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
                <div className="flex items-center justify-center h-64">
                  <p className="text-[#64748B]">Course-specific analysis would appear here...</p>
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
                <div className="flex items-center justify-center h-64">
                  <p className="text-[#64748B]">Overall performance metrics would appear here...</p>
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
function Settings({ className, ...props }) {
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

function PieChartIcon({ className, ...props }) {
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

function BarChart2({ className, ...props }) {
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

function Check({ className, ...props }) {
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

function AlertTriangle({ className, ...props }) {
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

function MoreVertical({ className, ...props }) {
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

function TrendingDown({ className, ...props }) {
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

function ChevronLeft({ className, ...props }) {
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

function ChevronRight({ className, ...props }) {
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

