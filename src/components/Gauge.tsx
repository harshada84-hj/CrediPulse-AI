import React from 'react';
import { motion } from 'motion/react';

interface GaugeProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: number;
}

export const Gauge: React.FC<GaugeProps> = ({ 
  score, 
  maxScore = 900, 
  label = 'Credit Score',
  size = 280 
}) => {
  const percentage = (score / maxScore) * 100;
  const strokeWidth = 14;
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color logic
  const getColor = (s: number) => {
    if (s >= 750) return '#10b981'; // green
    if (s >= 600) return '#fbbf24'; // yellow
    if (s >= 450) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-800"
        />
        {/* Progress line */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      
      <div className="absolute flex flex-col items-center">
        <motion.span 
          className="text-5xl font-extrabold tracking-tight font-display"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-sm uppercase tracking-widest text-gray-500 font-medium">
          {label}
        </span>
      </div>
    </div>
  );
};
