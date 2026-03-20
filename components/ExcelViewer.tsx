'use client';

import React, { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  ArrowUpDown, 
  Search, 
  X,
  Download,
  Filter,
  Sun,
  Moon,
  Loader2,
  AlertCircle,
  Table as TableIcon,
  BarChart3,
  Bot,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import ExcelTable from './ExcelTable';
import ExcelCharts from './ExcelCharts';
import ExcelAI from './ExcelAI';
import ExcelSummary from './ExcelSummary';

type DataRow = Record<string, any>;

export default function ExcelViewer() {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'ai' | 'summary'>('table');

  const loadSheetData = useCallback((wb: XLSX.WorkBook, sheetName: string) => {
    try {
      const worksheet = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as DataRow[];
      
      setActiveSheet(sheetName);
      if (jsonData.length > 0) {
        setHeaders(Object.keys(jsonData[0]));
        setData(jsonData);
      } else {
        setHeaders([]);
        setData([]);
      }
    } catch (err) {
      setError(`Failed to load data from sheet: ${sheetName}`);
      console.error(err);
    }
  }, []);

  const processWorkbook = useCallback((wb: XLSX.WorkBook, name: string) => {
    try {
      setWorkbook(wb);
      setSheets(wb.SheetNames);
      setFileName(name);
      setError(null);
      
      if (wb.SheetNames.length > 0) {
        loadSheetData(wb, wb.SheetNames[0]);
      } else {
        setError("The workbook contains no sheets.");
      }
    } catch (err) {
      setError("Failed to parse the workbook data.");
      console.error(err);
    }
  }, [loadSheetData]);

  const handleSheetChange = (sheetName: string) => {
    if (workbook) {
      loadSheetData(workbook, sheetName);
    }
  };

  const handleDataChange = (newData: DataRow[]) => {
    setData(newData);
    // Update the workbook in memory
    if (workbook && activeSheet) {
      const newWorksheet = XLSX.utils.json_to_sheet(newData);
      workbook.Sheets[activeSheet] = newWorksheet;
      setWorkbook({ ...workbook });
    }
  };

  const handleExport = () => {
    if (!workbook || !fileName) return;
    try {
      // Ensure the current data is synced to the workbook before exporting
      if (activeSheet) {
        const newWorksheet = XLSX.utils.json_to_sheet(data);
        workbook.Sheets[activeSheet] = newWorksheet;
      }
      XLSX.writeFile(workbook, `edited_${fileName}`);
    } catch (err) {
      console.error("Export failed", err);
      setError("Failed to export the file.");
    }
  };

  const handleFileUpload = useCallback((file: File) => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        processWorkbook(wb, file.name);
      } catch (err) {
        setError("Failed to parse the file. Please ensure it's a valid Excel file.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading the file from your device.");
      setIsLoading(false);
    };
    reader.readAsBinaryString(file);
  }, [processWorkbook]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      handleFileUpload(file);
    } else {
      setError("Please upload a valid .xlsx, .xls, or .csv file.");
    }
  }, [handleFileUpload]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const reset = () => {
    setWorkbook(null);
    setSheets([]);
    setActiveSheet('');
    setData([]);
    setHeaders([]);
    setFileName(null);
    setError(null);
    setActiveTab('table');
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-300",
      isDarkMode 
        ? "bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white" 
        : "bg-[#F8F9FA] text-[#1A1C1E] selection:bg-indigo-100 selection:text-indigo-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-10 px-6 py-4 border-b transition-colors duration-300",
        isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all",
              isDarkMode ? "bg-zinc-100 text-black" : "bg-indigo-600 text-white shadow-indigo-600/20"
            )}>
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Excel Insight</h1>
              <p className={cn(
                "text-xs font-medium uppercase tracking-wider",
                isDarkMode ? "text-zinc-500" : "text-zinc-500"
              )}>Interactive Data Viewer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-xl transition-all border",
                isDarkMode 
                  ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800" 
                  : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {fileName && (
              <div className="flex items-center gap-4">
                <div className={cn(
                  "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors",
                  isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
                )}>
                  <FileSpreadsheet className={cn("w-4 h-4", isDarkMode ? "text-zinc-500" : "text-zinc-500")} />
                  <span className={cn("text-sm font-medium max-w-[200px] truncate", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>{fileName}</span>
                  <button onClick={reset} className={cn("p-1 rounded-md transition-colors", isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-200")}>
                    <X className="w-3 h-3 text-zinc-500" />
                  </button>
                </div>
                <button 
                  onClick={reset}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2",
                    isDarkMode 
                      ? "bg-zinc-100 text-black hover:bg-white" 
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  New Upload
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <AnimatePresence mode="wait">
          {!fileName ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div 
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={cn(
                  "relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center text-center",
                  isDragging 
                    ? (isDarkMode ? "border-white bg-zinc-900/50 scale-[1.02]" : "border-indigo-500 bg-indigo-50/50 scale-[1.02]")
                    : (isDarkMode ? "border-zinc-800 bg-black hover:border-zinc-700 hover:bg-zinc-900/30" : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"),
                  isLoading && "opacity-50 pointer-events-none"
                )}
              >
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={isLoading}
                />
                
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-8 transition-all duration-300",
                  isDragging 
                    ? (isDarkMode ? "bg-white text-black scale-110" : "bg-indigo-600 text-white scale-110") 
                    : (isDarkMode ? "bg-zinc-900 text-zinc-600 group-hover:bg-zinc-800 group-hover:text-zinc-400" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-500")
                )}>
                  {isLoading ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
                </div>
                
                <h2 className="text-2xl font-bold mb-3 tracking-tight">Upload your Spreadsheet</h2>
                <p className="text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">
                  Drag and drop your <span className={cn("font-bold", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>.xlsx</span> or <span className={cn("font-bold", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>.xls</span> files here, or click to browse your computer.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <FeatureBadge isDarkMode={isDarkMode} icon={<ArrowUpDown className="w-4 h-4" />}>Sortable Columns</FeatureBadge>
                  <FeatureBadge isDarkMode={isDarkMode} icon={<Search className="w-4 h-4" />}>Global Search</FeatureBadge>
                  <FeatureBadge isDarkMode={isDarkMode} icon={<LayoutDashboard className="w-4 h-4" />}>Data Dashboard</FeatureBadge>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-8 p-4 rounded-xl border text-sm text-left flex items-start gap-3",
                    isDarkMode 
                      ? "bg-red-950/30 border-red-900/50 text-red-400" 
                      : "bg-red-50 border-red-200 text-red-600"
                  )}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </motion.div>
              )}
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard 
                  isDarkMode={isDarkMode}
                  title="Instant Parsing" 
                  desc="Fast processing of large datasets directly in your browser."
                />
                <FeatureCard 
                  isDarkMode={isDarkMode}
                  title="Dynamic Sorting" 
                  desc="Click any header to sort your data instantly."
                />
                <FeatureCard 
                  isDarkMode={isDarkMode}
                  title="Privacy First" 
                  desc="Your data stays on your device. We never upload files to a server."
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                      activeTab === 'summary' 
                        ? (isDarkMode ? "bg-zinc-800 text-white" : "bg-zinc-900 text-white") 
                        : (isDarkMode ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200" : "text-zinc-600 hover:bg-zinc-100")
                    )}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('table')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                      activeTab === 'table' 
                        ? (isDarkMode ? "bg-zinc-800 text-white" : "bg-zinc-900 text-white") 
                        : (isDarkMode ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200" : "text-zinc-600 hover:bg-zinc-100")
                    )}
                  >
                    <TableIcon className="w-4 h-4" />
                    Data View
                  </button>
                  <button
                    onClick={() => setActiveTab('charts')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                      activeTab === 'charts' 
                        ? (isDarkMode ? "bg-zinc-800 text-white" : "bg-zinc-900 text-white") 
                        : (isDarkMode ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200" : "text-zinc-600 hover:bg-zinc-100")
                    )}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Charts
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                      activeTab === 'ai' 
                        ? (isDarkMode ? "bg-zinc-800 text-white" : "bg-zinc-900 text-white") 
                        : (isDarkMode ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200" : "text-zinc-600 hover:bg-zinc-100")
                    )}
                  >
                    <Bot className="w-4 h-4" />
                    Ask AI
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {sheets.length > 1 && (
                    <div className="relative flex items-center">
                      <Layers className={cn(
                        "absolute left-3 w-4 h-4",
                        isDarkMode ? "text-zinc-500" : "text-zinc-400"
                      )} />
                      <select
                        value={activeSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className={cn(
                          "pl-9 pr-8 py-2 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all appearance-none",
                          isDarkMode 
                            ? "bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-zinc-700" 
                            : "bg-white border-zinc-200 text-zinc-700 focus:ring-indigo-500/20"
                        )}
                      >
                        {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <button 
                    onClick={handleExport}
                    className={cn(
                      "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all shadow-sm",
                      isDarkMode 
                        ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" 
                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl border text-sm text-left flex items-start gap-3",
                    isDarkMode 
                      ? "bg-red-950/30 border-red-900/50 text-red-400" 
                      : "bg-red-50 border-red-200 text-red-600"
                  )}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </motion.div>
              )}

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'summary' && (
                  <ExcelSummary 
                    data={data} 
                    headers={headers} 
                    isDarkMode={isDarkMode} 
                  />
                )}
                {activeTab === 'table' && (
                  <ExcelTable 
                    data={data} 
                    headers={headers} 
                    isDarkMode={isDarkMode} 
                    onDataChange={handleDataChange} 
                  />
                )}
                {activeTab === 'charts' && (
                  <ExcelCharts 
                    data={data} 
                    headers={headers} 
                    isDarkMode={isDarkMode} 
                  />
                )}
                {activeTab === 'ai' && (
                  <ExcelAI 
                    data={data} 
                    headers={headers} 
                    isDarkMode={isDarkMode} 
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function FeatureBadge({ children, icon, isDarkMode }: { children: React.ReactNode; icon: React.ReactNode; isDarkMode: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium shadow-sm transition-colors",
      isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-zinc-200 text-zinc-600"
    )}>
      <div className={isDarkMode ? "text-zinc-100" : "text-indigo-500"}>
        {icon}
      </div>
      {children}
    </div>
  );
}

function FeatureCard({ title, desc, isDarkMode }: { title: string; desc: string; isDarkMode: boolean }) {
  return (
    <div className={cn(
      "border p-6 rounded-2xl shadow-sm transition-all",
      isDarkMode 
        ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900" 
        : "bg-white border-zinc-200 hover:shadow-md"
    )}>
      <h3 className={cn("font-bold mb-2 transition-colors", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}
