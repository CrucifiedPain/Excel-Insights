'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  UploadCloud,
  FileSpreadsheet,
  Table as TableIcon,
  BarChart3,
  Layers,
  LayoutDashboard,
  Settings2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Download,
  Trash2,
  RefreshCw,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

type DataRow = Record<string, unknown>;

export default function ExcelViewer() {
  const [, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'summary'>('table');

  const [parseSettings, setParseSettings] = useState({ startCell: '', endCell: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [excludedCols, setExcludedCols] = useState<Set<string>>(new Set());

  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Chart states
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const [xAxisCol, setXAxisCol] = useState<string>('');
  const [yAxisCol, setYAxisCol] = useState<string>('');

  useEffect(() => {
  }, []);

  const loadSheetData = useCallback((wb: XLSX.WorkBook, sheetName: string, config?: { startCell: string, endCell: string }) => {
    try {
      const worksheet = wb.Sheets[sheetName];
      const options: XLSX.Sheet2JSONOpts = { defval: null };
      const currentConfig = config || parseSettings;

      if (currentConfig.startCell || currentConfig.endCell) {
         const ref = worksheet['!ref'];
         if (ref) {
             const parsedRef = XLSX.utils.decode_range(ref);
             let s_r = parsedRef.s.r, s_c = parsedRef.s.c, e_r = parsedRef.e.r, e_c = parsedRef.e.c;
             
             if (currentConfig.startCell) {
                 try { const s = XLSX.utils.decode_cell(currentConfig.startCell); s_r = s.r; s_c = s.c; } catch { /* ignore */ }
             }
             if (currentConfig.endCell) {
                 try { const e = XLSX.utils.decode_cell(currentConfig.endCell); e_r = e.r; e_c = e.c; } catch { /* ignore */ }
             }
             
             if (s_r <= e_r && s_c <= e_c) {
                 options.range = XLSX.utils.encode_range({ s: { r: s_r, c: s_c }, e: { r: e_r, c: e_c } });
             } else {
                 console.warn("Invalid custom range, falling back to default");
             }
         }
      }
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, options) as DataRow[];
      
      setActiveSheet(sheetName);
      if (jsonData.length > 0) {
        const allHeaders = Object.keys(jsonData[0]);
        setRawHeaders(allHeaders);
        setRawData(jsonData);
        setExcludedCols(new Set());
        setHeaders(allHeaders);
        setData(jsonData);
        
        if (allHeaders.length > 0) setXAxisCol(allHeaders[0]);
        if (allHeaders.length > 1) setYAxisCol(allHeaders[1]);
      } else {
        setRawHeaders([]);
        setRawData([]);
        setExcludedCols(new Set());
        setHeaders([]);
        setData([]);
      }
    } catch (err) {
      setError(`Failed to load data from sheet: ${sheetName}`);
      console.error(err);
    }
  }, [parseSettings]);

  const processWorkbook = useCallback((wb: XLSX.WorkBook, name: string) => {
    try {
      setParseSettings({ startCell: '', endCell: '' });
      setExcludedCols(new Set());
      setWorkbook(wb);
      setSheets(wb.SheetNames);
      setFileName(name);
      
      if (wb.SheetNames.length > 0) {
        loadSheetData(wb, wb.SheetNames[0], { startCell: '', endCell: '' });
      } else {
        setError("The workbook contains no sheets.");
      }
    } catch {
      setError("Failed to parse the workbook. Please ensure it's a valid Excel file.");
    } finally {
      setIsLoading(false);
    }
  }, [loadSheetData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (f: File) => {
    setIsLoading(true);
    setFile(f);
    setError(null);
    
    if (f.name.toLowerCase().endsWith('.csv')) {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          try {
            const parsedData = results.data as DataRow[];
            const allHeaders = results.meta.fields || [];
            
            const worksheet = XLSX.utils.json_to_sheet(parsedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, worksheet, 'CSV Data');
            
            setParseSettings({ startCell: '', endCell: '' });
            setExcludedCols(new Set());
            setWorkbook(wb);
            setSheets(['CSV Data']);
            setFileName(f.name);
            setActiveSheet('CSV Data');
            
            setRawHeaders(allHeaders);
            setRawData(parsedData);
            setHeaders(allHeaders);
            setData(parsedData);
            
            if (allHeaders.length > 0) setXAxisCol(allHeaders[0]);
            if (allHeaders.length > 1) setYAxisCol(allHeaders[1]);
            
            setIsLoading(false);
          } catch {
            setError("Failed to process the CSV file.");
            setIsLoading(false);
          }
        },
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`);
          setIsLoading(false);
        }
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result;
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        processWorkbook(wb, f.name);
      } catch {
        setIsLoading(false);
        setError("Failed to read the file. It might be corrupted or unsupported.");
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const toggleColumn = useCallback((col: string) => {
    const nextExcluded = new Set(excludedCols);
    if (nextExcluded.has(col)) nextExcluded.delete(col);
    else nextExcluded.add(col);
    
    setExcludedCols(nextExcluded);
    
    const newHeaders = rawHeaders.filter(h => !nextExcluded.has(h));
    setHeaders(newHeaders);
    const newData = rawData.map(row => {
        const newRow: Record<string, unknown> = {};
        newHeaders.forEach(h => newRow[h] = row[h]);
        return newRow;
    });
    setData(newData);
    
    if (workbook && activeSheet) {
      const newWorksheet = XLSX.utils.json_to_sheet(newData);
      workbook.Sheets[activeSheet] = newWorksheet;
      setWorkbook({ ...workbook });
    }
  }, [excludedCols, rawData, rawHeaders, workbook, activeSheet]);


  const filteredData = useMemo(() => {
    let result = data.map((row, index) => ({ row, index }));
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(({ row }) => {
        return headers.some(h => String(row[h]).toLowerCase().includes(lowerQuery));
      });
    }
    return result;
  }, [data, searchQuery, headers]);

  const toggleRowSelection = (originalIndex: number) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(originalIndex)) newSet.delete(originalIndex);
    else newSet.add(originalIndex);
    setSelectedRows(newSet);
  };

  const toggleAllRowsSelection = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(item => item.index))); // Index relative to original data
    }
  };

  const deleteSelectedRows = () => {
    if (selectedRows.size === 0) return;
    const newData = data.filter((_, i) => !selectedRows.has(i));
    setData(newData);
    setSelectedRows(new Set());
    
    if (workbook && activeSheet) {
      const newWorksheet = XLSX.utils.json_to_sheet(newData);
      workbook.Sheets[activeSheet] = newWorksheet;
      setWorkbook({ ...workbook });
    }
  };

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const csv = Papa.unparse(filteredData.map(item => item.row));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${fileName?.split('.')[0] || 'data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (!workbook || !fileName) return;
    XLSX.writeFile(workbook, `modified_${fileName}`);
  };

  const clearState = () => {
    setFile(null);
    setWorkbook(null);
    setSheets([]);
    setActiveSheet('');
    setData([]);
    setHeaders([]);
    setRawData([]);
    setRawHeaders([]);
    setExcludedCols(new Set());
    setParseSettings({ startCell: '', endCell: '' });
    setShowSettings(false);
    setFileName(null);
    setError(null);
    setActiveTab('table');
    setSearchQuery('');
    setSelectedRows(new Set());
  };

  // Generate basic summary statistics
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0 || headers.length === 0) return null;
    
    const stats: Record<string, { type: string, nulls: number, min?: number, max?: number, unique?: number, textSample?: string }> = {};
    
    headers.forEach(h => {
      const values = filteredData.map(({ row }) => row[h]);
      const validValues = values.filter(v => v !== null && v !== undefined && v !== '');
      
      const isNumeric = validValues.length > 0 && validValues.every(v => typeof v === 'number' || (!isNaN(Number(v)) && typeof v === 'string'));
      
      if (isNumeric) {
        const numValues = validValues.map(v => Number(v));
        stats[h] = {
          type: 'Numeric',
          nulls: values.length - validValues.length,
          min: Math.min(...numValues),
          max: Math.max(...numValues),
        };
      } else {
        const unique = new Set(validValues).size;
        stats[h] = {
          type: 'Text/Mixed',
          nulls: values.length - validValues.length,
          unique: unique,
          textSample: validValues[0] ? String(validValues[0]).substring(0, 20) + (String(validValues[0]).length > 20 ? '...' : '') : 'N/A'
        };
      }
    });
    
    return stats;
  }, [filteredData, headers]);


  const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e', '#0ea5e9'];

  const renderChart = () => {
    if (filteredData.length === 0 || !xAxisCol || !yAxisCol) return <div className="p-8 text-center text-zinc-500">Not enough data to render chart</div>;
    
    // Process data for charting: max 100 rows, try to cast Y to number
    const chartData = filteredData.slice(0, 100).map(({ row }) => ({
      name: String(row[xAxisCol]),
      value: typeof row[yAxisCol] === 'number' ? row[yAxisCol] : (Number(row[yAxisCol]) || 0)
    }));

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#eee'} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke={isDarkMode ? '#aaa' : '#666'} />
              <YAxis stroke={isDarkMode ? '#aaa' : '#666'} />
              <RechartsTooltip contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#fff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7', color: isDarkMode ? '#fff' : '#000' }} />
              <Legend />
              <Bar dataKey="value" name={yAxisCol} fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#eee'} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke={isDarkMode ? '#aaa' : '#666'} />
              <YAxis stroke={isDarkMode ? '#aaa' : '#666'} />
              <RechartsTooltip contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#fff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7', color: isDarkMode ? '#fff' : '#000' }} />
              <Legend />
              <Line type="monotone" dataKey="value" name={yAxisCol} stroke="#ec4899" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#eee'} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke={isDarkMode ? '#aaa' : '#666'} />
              <YAxis stroke={isDarkMode ? '#aaa' : '#666'} />
              <RechartsTooltip contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#fff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7', color: isDarkMode ? '#fff' : '#000' }} />
              <Legend />
              <Area type="monotone" dataKey="value" name={yAxisCol} stroke="#14b8a6" fill="#ccfbf1" fillOpacity={isDarkMode ? 0.2 : 0.8} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        // Aggregate for pie
        const agg: Record<string, number> = {};
        chartData.forEach(d => {
          if (d.value > 0) {
            agg[d.name] = (agg[d.name] || 0) + d.value;
          }
        });
        const pieData = Object.keys(agg).map(k => ({ name: k, value: agg[k] })).sort((a,b) => b.value - a.value).slice(0, 10); // top 10
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value" nameKey="name" label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#fff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7', color: isDarkMode ? '#fff' : '#000' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Top Header */}
      <header className={cn(
        "px-6 py-4 border-b sticky top-0 z-20 backdrop-blur-md",
        isDarkMode ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-200 bg-white/80"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isDarkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"
            )}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Excel Viewer</h1>
              <p className={cn("text-xs", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>Local processing • Secure • Analytical</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800" : "bg-zinc-100 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50"
              )}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            {fileName && (
              <div className="flex items-center gap-3">
                <span className={cn("text-sm font-medium", isDarkMode ? "text-zinc-300" : "text-zinc-600")}>
                  {fileName}
                </span>
                <button 
                  onClick={clearState}
                  className={cn(
                    "p-2 flex items-center justify-center rounded-lg transition-colors",
                    isDarkMode ? "hover:bg-zinc-800 text-zinc-400 hover:text-rose-400" : "hover:bg-zinc-100 text-zinc-500 hover:text-rose-600"
                  )}
                  title="Close file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-140px)] flex flex-col items-center justify-center space-y-6"
            >
              <RefreshCw className="w-12 h-12 animate-spin text-indigo-500" />
              <h2 className="text-xl font-bold animate-pulse">Processing Spreadsheet...</h2>
              <p className={cn("text-sm", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                Parsing rows and analyzing data structure
              </p>

              {/* Skeleton Mockup */}
              <div className={cn(
                "w-full max-w-4xl mt-8 border rounded-2xl p-6 overflow-hidden",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                 <div className="flex gap-4 mb-6">
                    <div className={cn("h-10 w-32 rounded-xl animate-pulse", isDarkMode ? "bg-zinc-800" : "bg-zinc-200")} />
                    <div className={cn("h-10 w-32 rounded-xl animate-pulse", isDarkMode ? "bg-zinc-800" : "bg-zinc-200")} />
                    <div className={cn("h-10 w-full rounded-xl animate-pulse", isDarkMode ? "bg-zinc-800" : "bg-zinc-200")} />
                 </div>
                 <div className="space-y-4">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex gap-4">
                        <div className={cn("h-6 w-12 rounded animate-pulse", isDarkMode ? "bg-zinc-800" : "bg-zinc-200")} />
                        <div className={cn("h-6 flex-1 rounded animate-pulse delay-75", isDarkMode ? "bg-zinc-800" : "bg-zinc-200")} />
                        <div className={cn("h-6 w-1/4 rounded animate-pulse delay-150", isDarkMode ? "bg-zinc-800" : "bg-zinc-200")} />
                        <div className={cn("h-6 w-1/4 rounded animate-pulse delay-200", isDarkMode ? "bg-zinc-800" : "bg-zinc-200")} />
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          ) : !workbook ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-[calc(100vh-140px)] flex items-center justify-center"
            >
              <div className="w-full max-w-xl">
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group relative overflow-hidden",
                    isDragging 
                      ? (isDarkMode ? "border-indigo-500 bg-indigo-500/10" : "border-indigo-500 bg-indigo-50")
                      : (isDarkMode ? "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50" : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100/50")
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) handleFile(files[0]);
                  }}
                >
                  <input 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  <div className={cn(
                    "w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg",
                    isDarkMode ? "bg-zinc-800 shadow-black/50 text-indigo-400" : "bg-white shadow-indigo-500/10 text-indigo-600"
                  )}>
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">Upload Spreadsheet</h3>
                  <p className={cn("text-sm mb-8", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                    Drag and drop your Excel file here, or click to browse. <br/>
                    Supports .xlsx, .xls, and .csv
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8 text-left">
                    <div className={cn("p-4 rounded-xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm")}>
                      <TableIcon className="w-5 h-5 mb-2 text-indigo-500" />
                      <h4 className="font-bold text-sm">View Data</h4>
                      <p className={cn("text-xs mt-1", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>View and filter your spreadsheet data easily.</p>
                    </div>
                    <div className={cn("p-4 rounded-xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm")}>
                      <LayoutDashboard className="w-5 h-5 mb-2 text-emerald-500" />
                      <h4 className="font-bold text-sm">Summary</h4>
                      <p className={cn("text-xs mt-1", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>Get instant statistics on columns.</p>
                    </div>
                    <div className={cn("p-4 rounded-xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm")}>
                      <BarChart3 className="w-5 h-5 mb-2 text-amber-500" />
                      <h4 className="font-bold text-sm">Visualize</h4>
                      <p className={cn("text-xs mt-1", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>Create charts instantly from your data.</p>
                    </div>
                    <div className={cn("p-4 rounded-xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm")}>
                      <Download className="w-5 h-5 mb-2 text-rose-500" />
                      <h4 className="font-bold text-sm">Export</h4>
                      <p className={cn("text-xs mt-1", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>Export filtered data to CSV or Excel.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider">
                     <span className={cn("px-3 py-1 rounded-full", isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-white text-zinc-600 shadow-sm")}>Fully Local</span>
                     <span className={cn("px-3 py-1 rounded-full", isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-white text-zinc-600 shadow-sm")}>Fast Parsing</span>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-4 left-0 right-0 p-4 mx-8 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm">
                      {error}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Parse Settings Panel */}
              <div className={cn(
                "border rounded-2xl transition-all overflow-hidden shadow-sm",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "w-full px-6 py-4 flex items-center justify-between font-bold text-sm transition-colors",
                    isDarkMode ? "hover:bg-zinc-800/80 text-zinc-200" : "hover:bg-zinc-50 text-zinc-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Settings2 className={cn("w-5 h-5", isDarkMode ? "text-indigo-400" : "text-indigo-600")} />
                    Data Import & Parse Settings
                  </div>
                  {showSettings ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={cn("p-6 border-t", isDarkMode ? "border-zinc-800" : "border-zinc-200")}>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Coordinates */}
                          <div className="space-y-4">
                            <h4 className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                              <Layers className="w-3.5 h-3.5" /> Cell Coordinates
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={cn("block text-xs font-medium mb-1.5", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>Start Cell</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. A1" 
                                  value={parseSettings.startCell}
                                  onChange={(e) => setParseSettings(p => ({...p, startCell: e.target.value.toUpperCase()}))}
                                  className={cn(
                                    "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all",
                                    isDarkMode ? "bg-black border-zinc-800 text-white focus:border-zinc-600" : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500"
                                  )}
                                />
                              </div>
                              <div>
                                <label className={cn("block text-xs font-medium mb-1.5", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>End Cell (Optional)</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Z100" 
                                  value={parseSettings.endCell}
                                  onChange={(e) => setParseSettings(p => ({...p, endCell: e.target.value.toUpperCase()}))}
                                  className={cn(
                                    "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all",
                                    isDarkMode ? "bg-black border-zinc-800 text-white focus:border-zinc-600" : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500"
                                  )}
                                />
                              </div>
                            </div>
                            <button 
                              onClick={() => { if(workbook && activeSheet) loadSheetData(workbook, activeSheet, parseSettings); }}
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full mt-2 border",
                                isDarkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600" : "bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm"
                              )}
                            >
                              Apply Coordinates & Re-parse
                            </button>
                          </div>

                          {/* Column Selection */}
                          <div>
                             <h4 className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                                <TableIcon className="w-3.5 h-3.5" /> Column Selection
                             </h4>
                             {rawHeaders.length === 0 ? (
                                <p className={cn("text-sm italic", isDarkMode ? "text-zinc-600" : "text-zinc-400")}>No columns detected. Apply coordinates to parse.</p>
                             ) : (
                                <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                   {rawHeaders.map(col => {
                                      const isExcluded = excludedCols.has(col);
                                      return (
                                         <button
                                           key={col}
                                           onClick={() => toggleColumn(col)}
                                           className={cn(
                                             "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border font-medium transition-all max-w-[200px] truncate",
                                             !isExcluded 
                                               ? (isDarkMode ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30" : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100")
                                               : (isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 opacity-60" : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50 opacity-60")
                                           )}
                                           title={col}
                                         >
                                           {!isExcluded ? <CheckSquare className="w-3.5 h-3.5 shrink-0" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                                           <span className="truncate">{col}</span>
                                         </button>
                                      );
                                   })}
                                </div>
                             )}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  {[
                    { id: 'table', icon: <TableIcon className="w-4 h-4" />, label: 'Data Table' },
                    { id: 'summary', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Summary Stats' },
                    { id: 'charts', icon: <BarChart3 className="w-4 h-4" />, label: 'Visualize' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'table' | 'charts' | 'summary')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
                        activeTab === tab.id 
                          ? (isDarkMode ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20" : "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20")
                          : (isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900")
                      )}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-1 items-center justify-end gap-2 w-full md:w-auto">
                    {activeTab === 'table' && (
                      <div className="relative w-full max-w-xs transition-all">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDarkMode ? "text-zinc-500" : "text-zinc-400")} />
                        <input
                          type="text"
                          placeholder="Search across all columns..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={cn(
                            "w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2",
                            isDarkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700 focus:ring-zinc-800" : "bg-white border-zinc-200 focus:border-indigo-500 focus:ring-indigo-100 placeholder-zinc-400"
                          )}
                        />
                      </div>
                    )}
                    
                    {activeTab === 'table' && selectedRows.size > 0 && (
                      <button
                        onClick={deleteSelectedRows}
                        className={cn("px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 flex items-center gap-2 border", 
                          isDarkMode ? "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30" : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                        )}
                      >
                        <Trash2 className="w-4 h-4" /> Delete ({selectedRows.size})
                      </button>
                    )}

                    <select
                      value={activeSheet}
                      onChange={(e) => loadSheetData(workbook, e.target.value)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium border appearance-none w-full md:w-48 outline-none focus:ring-2",
                        isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-zinc-700" : "bg-white border-zinc-200 focus:ring-zinc-200"
                      )}
                    >
                      {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <button
                      onClick={handleExportCSV}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all shrink-0 group relative",
                        isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800" : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                      )}
                      title="Export Displayed Rows to CSV"
                    >
                      <Download className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded bg-indigo-500 text-white leading-tight">CSV</span>
                    </button>
                    
                    <button
                      onClick={handleExport}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all shrink-0 group relative",
                        isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800" : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                      )}
                      title="Export Modified Workbook (XLSX)"
                    >
                      <Download className="w-4 h-4" />
                       <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded bg-emerald-500 text-white leading-tight">XLS</span>
                    </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className={cn(
                "border rounded-2xl overflow-hidden min-h-[500px] flex flex-col",
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                {activeTab === 'table' && (
                  <div className="flex-1 overflow-auto bg-transparent relative">
                     {headers.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                          <TableIcon className="w-12 h-12 mb-4 opacity-50" />
                          <p>No valid table data to display.</p>
                          <p className="text-sm opacity-60">Adjust Parse Settings or select different columns.</p>
                        </div>
                     ) : filteredData.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                           <Search className="w-12 h-12 mb-4 opacity-50" />
                           <p>No rows found matching &quot;{searchQuery}&quot;</p>
                        </div>
                     ) : (
                        <table className="w-full text-sm text-left">
                          <thead className={cn(
                            "sticky top-0 z-10 text-xs uppercase font-bold",
                            isDarkMode ? "bg-zinc-900 text-zinc-400 border-b border-zinc-800" : "bg-zinc-100 text-zinc-500 border-b border-zinc-200"
                          )}>
                            <tr>
                              <th className={cn("px-4 py-4 w-12 text-center border-r", isDarkMode ? "border-zinc-800" : "border-zinc-200")}>
                                  <button onClick={toggleAllRowsSelection} className="flex items-center justify-center w-full h-full text-zinc-400 hover:text-indigo-500">
                                      {selectedRows.size === filteredData.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                  </button>
                              </th>
                              <th className={cn("px-4 py-4 border-b", isDarkMode ? "border-zinc-800" : "border-zinc-200 w-16 text-center")}>#</th>
                              {headers.map((h, i) => (
                                <th key={i} className={cn("px-6 py-4 border-b whitespace-nowrap", isDarkMode ? "border-zinc-800" : "border-zinc-200")}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData.slice(0, 1000).map(({ row, index: originalIndex }) => {
                              return (
                                <tr key={originalIndex} className={cn(
                                  "border-b last:border-0 transition-colors",
                                  isDarkMode ? "border-zinc-800/50 hover:bg-zinc-800/50" : "border-zinc-100 hover:bg-zinc-50",
                                  selectedRows.has(originalIndex) && (isDarkMode ? "bg-indigo-500/10 hover:bg-indigo-500/20" : "bg-indigo-50 hover:bg-indigo-100")
                                )}>
                                  <td className={cn("px-4 py-3 text-center border-r pointer-events-auto", isDarkMode ? "border-zinc-800/50" : "border-zinc-100")}>
                                      <button 
                                        onClick={() => toggleRowSelection(originalIndex)}
                                        className={cn("flex items-center justify-center w-full h-full text-zinc-400 hover:text-indigo-500", selectedRows.has(originalIndex) && "text-indigo-500")}
                                      >
                                          {selectedRows.has(originalIndex) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                      </button>
                                  </td>
                                  <td className={cn("px-6 py-3 font-mono text-xs opacity-50 text-center border-r", isDarkMode ? "border-zinc-800/50" : "border-zinc-100")}>{originalIndex + 1}</td>
                                  {headers.map((h, colIndex) => (
                                    <td key={colIndex} className="px-6 py-3 whitespace-nowrap max-w-xs truncate" title={String(row[h])}>
                                      {row[h] !== null && row[h] !== undefined ? String(row[h]) : <span className="opacity-30 italic">null</span>}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                     )}
                  </div>
                )}

                {activeTab === 'summary' && summaryStats && (
                  <div className="flex-1 p-6 overflow-auto">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><LayoutDashboard className="w-5 h-5" /> Summary Statistics</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
                        <h3 className={cn("text-xs uppercase font-bold tracking-widest mb-1", isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Total Rows</h3>
                        <p className="text-4xl font-light">{filteredData.length}</p>
                      </div>
                      <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
                         <h3 className={cn("text-xs uppercase font-bold tracking-widest mb-1", isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Active Columns</h3>
                         <p className="text-4xl font-light">{headers.length}</p>
                      </div>
                      <div className={cn("p-6 rounded-2xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
                         <h3 className={cn("text-xs uppercase font-bold tracking-widest mb-1", isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Excluded Columns</h3>
                         <p className="text-4xl font-light">{excludedCols.size}</p>
                      </div>
                    </div>

                    <div className="mt-8">
                       <h3 className="font-bold text-lg mb-4">Column Analysis</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {Object.keys(summaryStats).map(h => {
                            const stat = summaryStats[h];
                            return (
                              <div key={h} className={cn("p-5 rounded-2xl border flex flex-col gap-3", isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm")}>
                                <div className="flex justify-between items-start">
                                   <div className="font-bold truncate max-w-[80%]" title={h}>{h}</div>
                                   <span className={cn("text-xs px-2 py-1 rounded-md font-mono", stat.type === 'Numeric' ? (isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600") : (isDarkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-50 text-amber-600"))}>{stat.type}</span>
                                </div>
                                
                                <div className="space-y-1 text-sm mt-auto">
                                   <div className="flex justify-between">
                                     <span className={cn(isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Null values:</span>
                                     <span className="font-mono">{stat.nulls}</span>
                                   </div>
                                   {stat.type === 'Numeric' ? (
                                      <>
                                        <div className="flex justify-between">
                                          <span className={cn(isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Min:</span>
                                          <span className="font-mono">{stat.min}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className={cn(isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Max:</span>
                                          <span className="font-mono">{stat.max}</span>
                                        </div>
                                      </>
                                   ) : (
                                     <>
                                        <div className="flex justify-between">
                                          <span className={cn(isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Unique values:</span>
                                          <span className="font-mono">{stat.unique}</span>
                                        </div>
                                        <div className="flex flex-col mt-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                          <span className={cn("text-xs mb-1", isDarkMode ? "text-zinc-500" : "text-zinc-500")}>Sample:</span>
                                          <span className="font-mono text-xs opacity-70 truncate">{stat.textSample}</span>
                                        </div>
                                     </>
                                   )}
                                </div>
                              </div>
                            )
                          })}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'charts' && (
                  <div className="flex flex-col h-full flex-1">
                    <div className={cn("p-4 border-b grid grid-cols-1 md:grid-cols-3 gap-4", isDarkMode ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-50")}>
                      <div>
                         <label className="block text-xs font-bold mb-1.5 opacity-70">Chart Type</label>
                         <select value={chartType} onChange={(e) => setChartType(e.target.value as 'bar' | 'line' | 'pie' | 'area')} className={cn("w-full px-3 py-2 border rounded-lg text-sm", isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200")}>
                           <option value="bar">Bar Chart</option>
                           <option value="line">Line Chart</option>
                           <option value="area">Area Chart</option>
                           <option value="pie">Pie Chart</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-bold mb-1.5 opacity-70">X-Axis (Category)</label>
                         <select value={xAxisCol} onChange={(e) => setXAxisCol(e.target.value)} className={cn("w-full px-3 py-2 border rounded-lg text-sm truncate", isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200")}>
                           {headers.map(h => <option key={h} value={h}>{h}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-bold mb-1.5 opacity-70">Y-Axis (Value)</label>
                         <select value={yAxisCol} onChange={(e) => setYAxisCol(e.target.value)} className={cn("w-full px-3 py-2 border rounded-lg text-sm truncate", isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200")}>
                           {headers.map(h => <option key={h} value={h}>{h}</option>)}
                         </select>
                      </div>
                    </div>
                    <div className="flex-1 min-h-[400px] p-6">
                      {renderChart()}
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
