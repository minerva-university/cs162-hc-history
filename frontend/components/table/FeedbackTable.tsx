"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  Clock,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ScoreDisplay from "./ScoreDisplay"; // numeric score pill

interface FeedbackItem {
  score: number;
  comment: string;
  outcome_name: string;
  assignment_title: string;
  course_title: string;
  course_code: string;
  term_title: string;
  created_on: string;
  weight: string;
  weight_numeric?: number;
}

type Props = {
  data: Readonly<FeedbackItem[]>;
};

export default function FeedbackTable({ data }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
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
