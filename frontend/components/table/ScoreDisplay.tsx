"use client";

import React from "react";

interface Props {
  score: number;
}

export default function ScoreDisplay({ score }: Props) {
  const style = (() => {
    if (score >= 4.5) return { g: "from-[#9F7AFA] to-[#8B6BF2]", s: "rgba(139,107,242,.5)" };
    if (score >= 3.5) return { g: "from-[#4A5DC7] to-[#3A4DB9]", s: "rgba(58,77,185,.5)"  };
    if (score >= 2.5) return { g: "from-[#85CF85] to-[#73C173]", s: "rgba(115,193,115,.5)" };
    if (score >= 1.5) return { g: "from-[#EAA56D] to-[#E89A5D]", s: "rgba(232,154,93,.5)" };
    return              { g: "from-[#EA6D6D] to-[#E85D5D]", s: "rgba(232,93,93,.5)"   };
  })();

  return (
    <div className="flex items-center">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 bg-gradient-to-br ${style.g}`}
        style={{ boxShadow: `0 8px 20px -4px ${style.s}` }}
      >
        <span className="font-bold text-white text-lg">{score}</span>
      </div>
    </div>
  );
}
