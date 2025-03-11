import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart
} from "recharts";

function App() {
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // tabs: overview, breakdown, comparison, radar

  // Color scheme
  const colors = {
    primary: "#4361ee",
    secondary: "#3f37c9",
    accent: "#4cc9f0",
    success: "#4CAF50",
    info: "#2196F3",
    warning: "#ff9100",
    danger: "#f44336",
    light: "#f8f9fa",
    dark: "#212529",
    background: "#ffffff",
    cardBg: "#ffffff",
    text: "#333333",
    lightText: "#6c757d",
    border: "#e0e0e0"
  };

  useEffect(() => {
    // Fetch grades data
    setLoading(true);
    axios.get("http://127.0.0.1:5000/grades")
      .then(response => {
        console.log("Fetched Grades Data:", response.data);
        setGrades(response.data);
        setFilteredGrades(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching grades:", error);
        setLoading(false);
      });
  }, []);

  const filterData = () => {
    let filtered = grades;
    if (selectedCourse) {
      filtered = filtered.filter(g => g[2] === selectedCourse);
    }
    if (selectedOutcome) {
      filtered = filtered.filter(g => g[3] === selectedOutcome);
    }
    if (selectedTerm) {
      filtered = filtered.filter(g => g[6] === selectedTerm);
    }
    setFilteredGrades(filtered);
  };

  // Prepare data for Bar Chart (Scores Distribution)
  const scoresData = filteredGrades.reduce((acc, grade) => {
    const score = grade[4] === "Not Graded" ? "0" : grade[4].toString();
    acc[score] = (acc[score] || 0) + 1;
    return acc;
  }, {});

  const scoresChartData = Object.entries(scoresData).map(([score, count]) => ({
    score, count
  }));

  // Prepare data for Line Chart (Score Trends Over Time)
  const trendData = filteredGrades
    .sort((a, b) => new Date(a[7]) - new Date(b[7]))
    .map(grade => ({
      date: new Date(grade[7]).toLocaleDateString(),
      score: grade[4] === "Not Graded" ? 0 : parseFloat(grade[4])
    }));

  // Prepare data for Class Comparison Chart
  const courseComparisonData = [...new Set(grades.map(g => g[2]))].map(course => {
    const courseGrades = filteredGrades.filter(g => g[2] === course);
    const validScores = courseGrades
      .filter(g => g[4] !== "Not Graded")
      .map(g => parseFloat(g[4]));
    
    const averageScore = validScores.length > 0 
      ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(2)
      : 0;
      
    return {
      course,
      averageScore: parseFloat(averageScore),
      count: courseGrades.length
    };
  }).filter(item => item.count > 0);

  // Prepare data for Radar Chart (HCs/LOs)
  const radarData = [...new Set(grades.map(g => g[3]))].map(outcome => {
    const outcomeGrades = filteredGrades.filter(g => g[3] === outcome);
    const validScores = outcomeGrades
      .filter(g => g[4] !== "Not Graded")
      .map(g => parseFloat(g[4]));
    
    const averageScore = validScores.length > 0 
      ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(2)
      : 0;
      
    return {
      outcome,
      score: parseFloat(averageScore)
    };
  }).filter(item => item.score > 0);

  // Custom styles
  const styles = {
    appContainer: {
      padding: "30px",
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundColor: colors.background,
      color: colors.text,
    },
    header: {
      textAlign: "center",
      color: colors.primary,
      marginBottom: "30px",
      fontSize: "32px",
      fontWeight: "600",
    },
    dashboard: {
      display: "grid",
      gap: "30px",
    },
    filterSection: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      padding: "20px",
      backgroundColor: colors.cardBg,
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      marginBottom: "30px",
    },
    filterLabel: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "500",
      color: colors.dark,
    },
    filterSelect: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: `1px solid ${colors.border}`,
      fontSize: "14px",
      backgroundColor: colors.light,
      transition: "border-color 0.3s",
    },
    button: {
      backgroundColor: colors.primary,
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.3s",
      margin: "10px 0",
      alignSelf: "end",
      justifySelf: "start",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    chartContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
      gap: "30px",
      marginBottom: "30px",
    },
    chartCard: {
      backgroundColor: colors.cardBg,
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      transition: "transform 0.3s, box-shadow 0.3s",
    },
    chartTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: colors.dark,
      textAlign: "center",
      marginBottom: "20px",
    },
    tableContainer: {
      backgroundColor: colors.cardBg,
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      overflowX: "auto",
    },
    tableTitle: {
      fontSize: "22px",
      fontWeight: "600",
      color: colors.dark,
      marginBottom: "20px",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
      fontSize: "14px",
    },
    tableHeader: {
      backgroundColor: colors.light,
      color: colors.dark,
      fontWeight: "600",
      textAlign: "left",
      padding: "12px 15px",
    },
    tableHeaderCell: {
      padding: "15px",
      borderBottom: `2px solid ${colors.border}`,
    },
    tableCell: {
      padding: "12px 15px",
      borderBottom: `1px solid ${colors.border}`,
    },
    tableRow: {
      transition: "background-color 0.3s",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
      fontSize: "18px",
      color: colors.lightText,
    },
    fullWidthChart: {
      backgroundColor: colors.cardBg,
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      marginBottom: "30px",
    },
    tabsContainer: {
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: "10px",
    },
    tab: {
      padding: "10px 20px",
      borderRadius: "6px 6px 0 0",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    activeTab: {
      backgroundColor: colors.primary,
      color: "white",
    },
    inactiveTab: {
      backgroundColor: colors.light,
      color: colors.dark,
    }
  };

  if (loading) {
    return (
      <div style={styles.appContainer}>
        <h1 style={styles.header}>Minerva Feedback Dashboard</h1>
        <div style={styles.loadingContainer}>
          Loading dashboard data...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <h1 style={styles.header}>Minerva Feedback Dashboard</h1>

      {/* Filters */}
      <div style={styles.filterSection}>
        <div>
          <label style={styles.filterLabel}>Course</label>
          <select 
            style={styles.filterSelect}
            onChange={(e) => setSelectedCourse(e.target.value)} 
            value={selectedCourse}
          >
            <option value="">All Courses</option>
            {[...new Set(grades.map(g => g[2]))].map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={styles.filterLabel}>Outcome</label>
          <select 
            style={styles.filterSelect}
            onChange={(e) => setSelectedOutcome(e.target.value)} 
            value={selectedOutcome}
          >
            <option value="">All Outcomes</option>
            {[...new Set(grades.map(g => g[3]))].map(outcome => (
              <option key={outcome} value={outcome}>{outcome}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={styles.filterLabel}>Term</label>
          <select 
            style={styles.filterSelect}
            onChange={(e) => setSelectedTerm(e.target.value)} 
            value={selectedTerm}
          >
            <option value="">All Terms</option>
            {[...new Set(grades.map(g => g[6]))].map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>

        <button 
          style={styles.button} 
          onClick={filterData}
          onMouseOver={(e) => e.target.style.backgroundColor = colors.secondary}
          onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
        >
          Apply Filters
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabsContainer}>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === "overview" ? styles.activeTab : styles.inactiveTab)
          }}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </div>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === "comparison" ? styles.activeTab : styles.inactiveTab)
          }}
          onClick={() => setActiveTab("comparison")}
        >
          Class Comparison
        </div>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === "radar" ? styles.activeTab : styles.inactiveTab)
          }}
          onClick={() => setActiveTab("radar")}
        >
          HC/LO Analysis
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Charts - 2 Column Layout */}
          <div style={styles.chartContainer}>
            {/* Bar Chart: Score Distribution */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoresChartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis 
                    dataKey="score" 
                    tick={{ fill: colors.dark }} 
                    tickMargin={10}
                  />
                  <YAxis tick={{ fill: colors.dark }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.light, 
                      borderColor: colors.border,
                      borderRadius: '6px'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar dataKey="count" name="Number of Assignments" fill={colors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Score Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: colors.dark }} 
                    tickMargin={10}
                  />
                  <YAxis tick={{ fill: colors.dark }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: colors.light, 
                      borderColor: colors.border,
                      borderRadius: '6px'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={colors.info} 
                    strokeWidth={2}
                    name="Score" 
                    dot={{ stroke: colors.info, strokeWidth: 2, r: 4 }}
                    activeDot={{ stroke: colors.info, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Class Comparison Tab */}
      {activeTab === "comparison" && courseComparisonData.length > 1 && (
        <div style={styles.fullWidthChart}>
          <h3 style={styles.chartTitle}>Average Score by Class</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={courseComparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis 
                dataKey="course" 
                tick={{ fill: colors.dark }} 
                tickMargin={10}
              />
              <YAxis 
                tick={{ fill: colors.dark }} 
                domain={[0, 5]} 
                label={{ value: 'Average Score', angle: -90, position: 'insideLeft', fill: colors.dark }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: colors.light, 
                  borderColor: colors.border,
                  borderRadius: '6px'
                }}
                formatter={(value, name) => [value.toFixed(2), name]}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar 
                dataKey="averageScore" 
                name="Average Score" 
                fill={colors.secondary} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Radar Chart Tab */}
      {activeTab === "radar" && radarData.length >= 3 && (
        <div style={styles.fullWidthChart}>
          <h3 style={styles.chartTitle}>HC/LO Performance Analysis</h3>
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart outerRadius={180} width={730} height={500} data={radarData}>
              <PolarGrid stroke={colors.border} />
              <PolarAngleAxis 
                dataKey="outcome" 
                tick={{ fill: colors.dark, fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 5]} 
                tick={{ fill: colors.dark }}
              />
              <Radar 
                name="Average Score" 
                dataKey="score" 
                stroke={colors.primary} 
                fill={colors.primary} 
                fillOpacity={0.5} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: colors.light, 
                  borderColor: colors.border,
                  borderRadius: '6px'
                }}
                formatter={(value) => value.toFixed(2)}
              />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableContainer}>
        <h2 style={styles.tableTitle}>Assignment Scores</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{...styles.tableHeaderCell, borderTopLeftRadius: '8px'}}>Assignment</th>
              <th style={styles.tableHeaderCell}>Course</th>
              <th style={styles.tableHeaderCell}>Outcome</th>
              <th style={styles.tableHeaderCell}>Score</th>
              <th style={styles.tableHeaderCell}>Comment</th>
              <th style={styles.tableHeaderCell}>Term</th>
              <th style={styles.tableHeaderCell}>Created On</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.length > 0 ? (
              filteredGrades.map((grade, index) => (
                <tr 
                  key={grade[0] ? `id-${grade[0]}` : `index-${index}`}
                  style={styles.tableRow}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.light}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={styles.tableCell}>{grade[1]}</td>  {/* Assignment Title */}
                  <td style={styles.tableCell}>{grade[2]}</td>  {/* Course Title */}
                  <td style={styles.tableCell}>{grade[3]}</td>  {/* Outcome Name */}
                  <td style={{...styles.tableCell, fontWeight: '600'}}>{grade[4]}</td>  {/* Score */}
                  <td style={styles.tableCell}>{grade[5]}</td>  {/* Comment */}
                  <td style={styles.tableCell}>{grade[6]}</td>  {/* Term */}
                  <td style={styles.tableCell}>{new Date(grade[7]).toLocaleDateString()}</td>  {/* Created On */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{...styles.tableCell, textAlign: 'center', padding: '30px'}}>
                  No data available with the current filters. Try adjusting your selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
