import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * Props for the ResultsChart component
 * @interface ResultsChartProps
 */
interface ResultsChartProps {
  /** Number of home team wins */
  homeWins: number;
  /** Number of draws */
  draws: number;
  /** Number of away team wins */
  awayWins: number;
  /** Custom colors for chart segments */
  colors?: {
    home?: string;
    draw?: string;
    away?: string;
  };
  /** Duration of the animation in milliseconds */
  animationDuration?: number;
  /** Custom labels for chart segments */
  labels?: {
    home?: string;
    draw?: string;
    away?: string;
  };
  /** Custom empty state message when no data is available */
  emptyMessage?: React.ReactNode;
}

/**
 * Renders a customized label for pie chart slices
 */
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  // Don't render label if percent is 0
  if (percent === 0) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#fff" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/**
 * Custom tooltip component for the pie chart
 */
const CustomTooltip = ({ active, payload, total }: { active?: boolean, payload?: any[], total: number }) => {
  if (active && payload && payload.length) {
    // Avoid division by zero
    const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0.0';
    
    return (
      <div className="bg-[#0c0f16] p-2 rounded-md border border-white/10 shadow-lg">
        <p className="text-xs font-medium text-white">
          {`${payload[0].name}: ${payload[0].value} (${percentage}%)`}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * ResultsChart Component
 * 
 * A pie chart showing the distribution of match results (home wins, draws, away wins).
 * 
 * @example
 * ```tsx
 * <ResultsChart 
 *   homeWins={25} 
 *   draws={10} 
 *   awayWins={15} 
 *   colors={{ home: "#10b981", draw: "#f59e0b", away: "#0ea5e9" }}
 *   animationDuration={800}
 * />
 * ```
 * 
 * @remarks
 * - All input values should be non-negative numbers
 * - The component handles zero total values gracefully
 * - Custom colors and animation duration can be provided via props
 */
export const ResultsChart = React.memo(React.forwardRef<any, ResultsChartProps>(({
  homeWins,
  draws,
  awayWins,
  colors = {},
  animationDuration = 1000,
  labels = {},
  emptyMessage = "Nincs elegendő adat"
}, ref) => {
  // Ensure counts are non-negative
  const safeHomeWins = Math.max(0, homeWins || 0);
  const safeDraws = Math.max(0, draws || 0);
  const safeAwayWins = Math.max(0, awayWins || 0);
  const total = safeHomeWins + safeDraws + safeAwayWins;
  
  // Default labels
  const defaultLabels = {
    home: 'Hazai győzelem',
    draw: 'Döntetlen',
    away: 'Vendég győzelem'
  };
  
  // Merge default and custom labels
  const mergedLabels = {
    ...defaultLabels,
    ...labels
  };
  
  // Default colors
  const defaultColors = {
    home: '#10b981', // emerald-500
    draw: '#f59e0b', // amber-500
    away: '#0ea5e9'  // sky-500
  };
  
  // Merge default and custom colors
  const mergedColors = {
    ...defaultColors,
    ...colors
  };
  
  // Memoize data to prevent unnecessary re-renders
  const data = React.useMemo(() => [
    { name: mergedLabels.home, value: safeHomeWins, color: mergedColors.home },
    { name: mergedLabels.draw, value: safeDraws, color: mergedColors.draw },
    { name: mergedLabels.away, value: safeAwayWins, color: mergedColors.away },
  ], [safeHomeWins, safeDraws, safeAwayWins, mergedLabels, mergedColors]);

  // Handle edge case: no data
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" ref={ref}>
      <PieChart>
        <Pie
          data={data.filter(item => item.value > 0)}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          animationDuration={animationDuration}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip total={total} />} />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          formatter={(value, entry, index) => (
            <span className="text-xs text-zinc-300">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}));

// Add display name for better debugging
ResultsChart.displayName = 'ResultsChart';

// Export types for documentation
export type { ResultsChartProps };