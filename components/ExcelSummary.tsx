'use client';

import React, { useMemo } from 'react';
import { 
  Info, 
  Hash, 
  Type, 
  Calendar, 
  TrendingUp, 
  BarChart, 
  PieChart,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DataRow = Record<string, any>;

interface ExcelSummaryProps {
  data: DataRow[];
  headers: string[];
  isDarkMode: boolean;
}

interface ColumnStat {
  name: string;
  type: 'numeric' | 'string' | 'date' | 'unknown';
  count: number;
  uniqueCount: number;
  nullCount: number;
  // For numeric
  min?: number;
  max?: number;
  sum?: number;
  avg?: number;
  // For categorical
  topValues?: { value: any; count: number }[];
}

export default function ExcelSummary({ data, headers, isDarkMode }: ExcelSummaryProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return [];

    return headers.map(header => {
      const values = data.map(row => row[header]).filter(v => v !== undefined && v !== null && v !== '');
      const nullCount = data.length - values.length;
      const uniqueValues = new Set(values);
      
      // Determine type
      let type: 'numeric' | 'string' | 'date' | 'unknown' = 'unknown';
      const firstValue = values[0];
      
      if (typeof firstValue === 'number') {
        type = 'numeric';
      } else if (typeof firstValue === 'string') {
        // Simple date check
        if (!isNaN(Date.parse(firstValue)) && firstValue.length > 5) {
          type = 'date';
        } else {
          type = 'string';
        }
      }

      const stat: ColumnStat = {
        name: header,
        type,
        count: values.length,
        uniqueCount: uniqueValues.size,
        nullCount,
      };

      if (type === 'numeric') {
        const numValues = values.map(v => Number(v)).filter(v => !isNaN(v));
        if (numValues.length > 0) {
          stat.min = Math.min(...numValues);
          stat.max = Math.max(...numValues);
          stat.sum = numValues.reduce((a, b) => a + b, 0);
          stat.avg = stat.sum / numValues.length;
        }
      } else if (type === 'string' || type === 'date') {
        const counts: Record<string, number> = {};
        values.forEach(v => {
          const s = String(v);
          counts[s] = (counts[s] || 0) + 1;
        });
        stat.topValues = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([value, count]) => ({ value, count }));
      }

      return stat;
    });
  }, [data, headers]);

  if (data.length === 0) {
    return (
      <div className={cn(
        "p-12 rounded-2xl border border-dashed text-center",
        isDarkMode ? "border-zinc-800 text-zinc-500" : "border-zinc-200 text-zinc-400"
      )}>
        <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>No data available to summarize.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <OverviewCard 
          isDarkMode={isDarkMode}
          icon={<Activity className="w-5 h-5" />}
          label="Total Rows"
          value={data.length.toLocaleString()}
        />
        <OverviewCard 
          isDarkMode={isDarkMode}
          icon={<Hash className="w-5 h-5" />}
          label="Total Columns"
          value={headers.length.toLocaleString()}
        />
        <OverviewCard 
          isDarkMode={isDarkMode}
          icon={<TrendingUp className="w-5 h-5" />}
          label="Numeric Columns"
          value={stats.filter(s => s.type === 'numeric').length.toString()}
        />
        <OverviewCard 
          isDarkMode={isDarkMode}
          icon={<Type className="w-5 h-5" />}
          label="Text Columns"
          value={stats.filter(s => s.type === 'string').length.toString()}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            className={cn(
              "p-6 rounded-2xl border transition-all",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                )}>
                  {stat.type === 'numeric' ? <Hash className="w-4 h-4" /> : 
                   stat.type === 'date' ? <Calendar className="w-4 h-4" /> : 
                   <Type className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className={cn("font-bold text-sm", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                    {stat.name}
                  </h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    {stat.type} • {stat.uniqueCount} unique values
                  </p>
                </div>
              </div>
              <div className={cn(
                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter",
                stat.nullCount > 0 
                  ? (isDarkMode ? "bg-amber-950/30 text-amber-500" : "bg-amber-50 text-amber-600")
                  : (isDarkMode ? "bg-emerald-950/30 text-emerald-500" : "bg-emerald-50 text-emerald-600")
              )}>
                {stat.nullCount > 0 ? `${stat.nullCount} missing` : 'Complete'}
              </div>
            </div>

            {stat.type === 'numeric' ? (
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Average" value={stat.avg?.toLocaleString(undefined, { maximumFractionDigits: 2 })} isDarkMode={isDarkMode} />
                <StatItem label="Sum" value={stat.sum?.toLocaleString()} isDarkMode={isDarkMode} />
                <StatItem label="Min" value={stat.min?.toLocaleString()} isDarkMode={isDarkMode} />
                <StatItem label="Max" value={stat.max?.toLocaleString()} isDarkMode={isDarkMode} />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Top Values</p>
                <div className="space-y-2">
                  {stat.topValues?.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className={cn("truncate max-w-[70%]", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>
                        {String(v.value) || '(empty)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 rounded-full bg-indigo-500")} style={{ width: `${(v.count / stat.count) * 40}px` }} />
                        <span className="text-xs font-mono text-zinc-500">{v.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewCard({ icon, label, value, isDarkMode }: { icon: React.ReactNode; label: string; value: string; isDarkMode: boolean }) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border",
      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
    )}>
      <div className={cn("mb-3", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
        {icon}
      </div>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn("text-2xl font-bold tracking-tight", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>{value}</p>
    </div>
  );
}

function StatItem({ label, value, isDarkMode }: { label: string; value: string | undefined; isDarkMode: boolean }) {
  return (
    <div className={cn(
      "p-3 rounded-xl",
      isDarkMode ? "bg-black/40" : "bg-zinc-50"
    )}>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn("text-lg font-bold font-mono", isDarkMode ? "text-zinc-200" : "text-zinc-800")}>{value ?? 'N/A'}</p>
    </div>
  );
}
