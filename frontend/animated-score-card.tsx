"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * AnimatedScoreCard Component
 * 
 * A reusable component that displays a score card with animations and dynamic styling.
 * Features:
 * - Color coding based on score value (excellent, good, average, fair, poor)
 * - Hover animations with floating particles
 * - Animated progress bar
 * - Dynamic shadow effects
 * 
 * Props:
 * - score: number - The score value (1-5)
 * - title: string - The title of the score card
 * - subtitle: string - Additional information displayed below the title
 * - icon: React.ReactNode - Icon to display in the top right
 */

interface AnimatedScoreCardProps {
  score: number
  title: string
  subtitle: string
  icon: React.ReactNode
}

export function AnimatedScoreCard({ score, title, subtitle, icon }: AnimatedScoreCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Get the color based on score
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "#8B6BF2" // Purple - Excellent
    if (score >= 3.5) return "#3A4DB9" // Blue - Good
    if (score >= 2.5) return "#73C173" // Green - Average
    if (score >= 1.5) return "#E89A5D" // Orange - Fair
    return "#E85D5D" // Red - Poor
  }

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const color = getScoreColor(score)

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-white rounded-xl shadow-lg overflow-hidden"
      style={{
        boxShadow: isHovered
          ? `0 20px 25px -5px ${color}30, 0 8px 10px -6px ${color}30`
          : `0 10px 15px -3px ${color}20, 0 4px 6px -4px ${color}20`,
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-5 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top right, ${color}, transparent 70%)`,
          opacity: isHovered ? 0.15 : 0.05,
        }}
      />

      {/* Content */}
      <div className="relative p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-[#0F172A]">{title}</h3>
            <p className="text-sm text-[#64748B]">{subtitle}</p>
          </div>
          <div className="text-[#64748B]">{icon}</div>
        </div>

        <div className="mt-4 flex items-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={`score-${isAnimating}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold"
              style={{ color }}
            >
              {score.toFixed(1)}
            </motion.div>
          </AnimatePresence>
          <span className="text-sm text-[#64748B] ml-1 mb-1">/ 5.0</span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(score / 5) * 100}%` }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${color}80, ${color})` }}
          />
        </div>

        {/* Floating particles */}
        {isHovered && (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 right-12 w-3 h-3 rounded-full"
              style={{ background: color, opacity: 0.4 }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute top-10 right-6 w-2 h-2 rounded-full"
              style={{ background: color, opacity: 0.3 }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute bottom-8 right-8 w-4 h-4 rounded-full"
              style={{ background: color, opacity: 0.2 }}
            />
          </>
        )}
      </div>
    </motion.div>
  )
}

