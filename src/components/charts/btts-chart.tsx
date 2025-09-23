import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * Props for the BTTSChart component
 * @interface BTTSChartProps
 */
interface BTTSChartProps {
  /** Number of matches where both teams scored */
  bttsCount: number;
  /** Number of matches where both teams did not score */
  nonBttsCount: number;
  /** Color for the BTTS (Yes) slice (default: '#8b5cf6' - violet) */
  bttsColor?: string;
  /** Color for the non-BTTS (No) slice (default: '#6b7280' - gray) */
  nonBttsColor?: string;
  /** Duration of the animation in milliseconds (default: 1000) */
  animationDuration?: number;
  /** Custom label for BTTS (Yes) slice (default: 'Igen') */
  bttsLabel?: string;
  /** Custom label for non-BTTS (No) slice (default: 'Nem') */
  nonBttsLabel?: string;
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
 * BTTS Chart Component
 * 
 * A pie chart showing the distribution of matches where both teams scored (BTTS) vs. those where they didn't.
 * 
 * @example
 * ```tsx
 * <BTTSChart 
 *   bttsCount={25} 
 *   nonBttsCount={75} 
 *   bttsColor="#8b5cf6"
 *   nonBttsColor="#6b7280"
 *   animationDuration={800}
 * />
 * ```
 */
export const BTTSChart = React.memo(React.forwardRef<any, BTTSChartProps>(({
  bttsCount,
  nonBttsCount,
  bttsColor = '#8b5cf6',
  nonBttsColor = '#6b7280',
  animationDuration = 1000,
  bttsLabel = 'Igen',
  nonBttsLabel = 'Nem'
}, ref) => {
  // Ensure counts are non-negative
  const safeBttsCount = Math.max(0, bttsCount || 0);
  const safeNonBttsCount = Math.max(0, nonBttsCount || 0);
  const total = safeBttsCount + safeNonBttsCount;
  
  // Memoize data to prevent unnecessary re-renders
  const data = React.useMemo(() => [
    { name: bttsLabel, value: safeBttsCount, color: bttsColor },
    { name: nonBttsLabel, value: safeNonBttsCount, color: nonBttsColor },
  ], [safeBttsCount, safeNonBttsCount, bttsColor, nonBttsColor, bttsLabel, nonBttsLabel]);

  // Handle edge case: no data
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-sm text-zinc-400">Nincs elegendő adat</p>
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
BTTSChart.displayName = 'BTTSChart';

// Export types for documentation
export type { BTTSChartProps };