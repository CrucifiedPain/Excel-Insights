'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

type DataRow = Record<string, any>;

interface ExcelChartsProps {
  data: DataRow[];
  headers: string[];
  isDarkMode: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ExcelCharts({ data, headers, isDarkMode }: ExcelChartsProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xAxis, setXAxis] = useState<string>(headers[0] || '');
  const [yAxis, setYAxis] = useState<string>(headers[1] || headers[0] || '');

  const chartData = useMemo(() => {
    if (!xAxis || !yAxis) return [];
    
    // Group and aggregate data if needed, or just take the first 50 rows to avoid clutter
    // For simplicity, let's just use the raw data and parse Y axis as numbers
    return data.slice(0, 50).map(item => ({
      name: String(item[xAxis] || ''),
      value: Number(item[yAxis]) || 0
    }));
  }, [data, xAxis, yAxis]);

  return (
    <div className="space-y-6">
      <div className={cn(
        "p-6 rounded-2xl border shadow-sm",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <button
              onClick={() => setChartType('bar')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                chartType === 'bar' 
                  ? (isDarkMode ? "bg-zinc-700 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                chartType === 'line' 
                  ? (isDarkMode ? "bg-zinc-700 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <LineChartIcon className="w-4 h-4" />
              Line
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                chartType === 'pie' 
                  ? (isDarkMode ? "bg-zinc-700 text-white shadow-sm" : "bg-white text-zinc-900 shadow-sm") 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <PieChartIcon className="w-4 h-4" />
              Pie
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full md:w-48">
              <label className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-zinc-500" : "text-zinc-500")}>X Axis (Labels)</label>
              <select 
                value={xAxis} 
                onChange={(e) => setXAxis(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2",
                  isDarkMode 
                    ? "bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-500" 
                    : "bg-white border-zinc-300 text-black focus:ring-indigo-500"
                )}
              >
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full md:w-48">
              <label className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Y Axis (Values)</label>
              <select 
                value={yAxis} 
                onChange={(e) => setYAxis(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2",
                  isDarkMode 
                    ? "bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-500" 
                    : "bg-white border-zinc-300 text-black focus:ring-indigo-500"
                )}
              >
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">
              No data available for the selected axes.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#3f3f46' : '#e5e7eb'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#a1a1aa' : '#6b7280'} tick={{fontSize: 12}} />
                  <YAxis stroke={isDarkMode ? '#a1a1aa' : '#6b7280'} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                      borderColor: isDarkMode ? '#27272a' : '#e5e7eb',
                      color: isDarkMode ? '#f4f4f5' : '#111827'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="value" name={yAxis} fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#3f3f46' : '#e5e7eb'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#a1a1aa' : '#6b7280'} tick={{fontSize: 12}} />
                  <YAxis stroke={isDarkMode ? '#a1a1aa' : '#6b7280'} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                      borderColor: isDarkMode ? '#27272a' : '#e5e7eb',
                      color: isDarkMode ? '#f4f4f5' : '#111827'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" name={yAxis} stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                      borderColor: isDarkMode ? '#27272a' : '#e5e7eb',
                      color: isDarkMode ? '#f4f4f5' : '#111827'
                    }} 
                  />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        <p className={cn("text-xs text-center mt-4", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
          Showing first 50 rows of data.
        </p>
      </div>
    </div>
  );
}
