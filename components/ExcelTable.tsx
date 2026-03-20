'use client';

import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type DataRow = Record<string, any>;

interface ExcelTableProps {
  data: DataRow[];
  headers: string[];
  isDarkMode: boolean;
  onDataChange: (newData: DataRow[]) => void;
}

export default function ExcelTable({ data, headers, isDarkMode, onDataChange }: ExcelTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; header: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const rowsPerPage = 15;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleCellDoubleClick = (rowIndex: number, header: string, value: any) => {
    setEditingCell({ rowIndex, header });
    setEditValue(value !== undefined && value !== null ? String(value) : '');
  };

  const handleCellSave = (rowIndex: number, header: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [header]: editValue };
    onDataChange(newData);
    setEditingCell(null);
  };

  const sortedData = useMemo(() => {
    let sortableItems: (DataRow & { _originalIndex: number })[] = data.map((item, index) => ({ ...item, _originalIndex: index }));
    
    if (searchTerm) {
      sortableItems = sortableItems.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [data, sortConfig, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
            isDarkMode ? "text-zinc-600 group-focus-within:text-white" : "text-zinc-400 group-focus-within:text-indigo-500"
          )} />
          <input 
            type="text"
            placeholder="Search in all columns..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={cn(
              "w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm",
              isDarkMode 
                ? "bg-zinc-900 border-zinc-800 text-white focus:ring-white/10 focus:border-zinc-600 placeholder:text-zinc-600" 
                : "bg-white border-zinc-200 text-[#1A1C1E] focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-zinc-400"
            )}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium shadow-sm transition-colors",
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-zinc-200 text-zinc-600"
          )}>
            <span className={isDarkMode ? "text-zinc-600" : "text-zinc-400"}>Total Rows:</span>
            <span className={cn("font-bold", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>{sortedData.length}</span>
          </div>
        </div>
      </div>

      <div className={cn(
        "border rounded-2xl overflow-hidden shadow-xl transition-all",
        isDarkMode ? "bg-black border-zinc-800 shadow-none" : "bg-white border-zinc-200 shadow-zinc-200/50"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn(
                "border-b transition-colors",
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-50/80 border-zinc-200"
              )}>
                {headers.map((header) => (
                  <th 
                    key={header}
                    onClick={() => handleSort(header)}
                    className={cn(
                      "px-6 py-4 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors group select-none whitespace-nowrap",
                      isDarkMode ? "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300" : "text-zinc-500 hover:bg-zinc-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {header}
                      <div className={cn(
                        "transition-colors",
                        sortConfig?.key === header 
                          ? (isDarkMode ? "text-white" : "text-indigo-600") 
                          : (isDarkMode ? "text-zinc-700 group-hover:text-zinc-500" : "text-zinc-300 group-hover:text-zinc-400")
                      )}>
                        {sortConfig?.key === header ? (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={cn("divide-y transition-colors", isDarkMode ? "divide-zinc-900" : "divide-zinc-100")}>
              {paginatedData.map((row, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  key={row._originalIndex} 
                  className={cn(
                    "transition-colors group",
                    isDarkMode ? "hover:bg-zinc-900/40" : "hover:bg-zinc-50/50"
                  )}
                >
                  {headers.map((header) => (
                    <td 
                      key={header} 
                      onDoubleClick={() => handleCellDoubleClick(row._originalIndex, header, row[header])}
                      className={cn(
                        "px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap",
                        isDarkMode ? "text-zinc-400 group-hover:text-zinc-200" : "text-zinc-600",
                        editingCell?.rowIndex === row._originalIndex && editingCell?.header === header && "p-2"
                      )}
                    >
                      {editingCell?.rowIndex === row._originalIndex && editingCell?.header === header ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellSave(row._originalIndex, header)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellSave(row._originalIndex, header);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className={cn(
                            "w-full px-2 py-1 border rounded focus:outline-none focus:ring-2",
                            isDarkMode 
                              ? "bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-500" 
                              : "bg-white border-zinc-300 text-black focus:ring-indigo-500"
                          )}
                        />
                      ) : (
                        row[header] !== undefined && row[header] !== null ? String(row[header]) : '-'
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {paginatedData.length === 0 && (
          <div className="p-20 text-center">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors",
              isDarkMode ? "bg-zinc-900" : "bg-zinc-100"
            )}>
              <Search className={cn("w-8 h-8", isDarkMode ? "text-zinc-700" : "text-zinc-300")} />
            </div>
            <h3 className={cn("text-lg font-bold", isDarkMode ? "text-zinc-200" : "text-zinc-900")}>No results found</h3>
            <p className="text-zinc-500">Try adjusting your search term.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className={cn(
            "px-6 py-4 border-t flex items-center justify-between transition-colors",
            isDarkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-zinc-50/50 border-zinc-200"
          )}>
            <p className="text-sm text-zinc-500 font-medium">
              Showing <span className={cn("font-bold", isDarkMode ? "text-zinc-200" : "text-zinc-900")}>{(currentPage - 1) * rowsPerPage + 1}</span> to <span className={cn("font-bold", isDarkMode ? "text-zinc-200" : "text-zinc-900")}>{Math.min(currentPage * rowsPerPage, sortedData.length)}</span> of <span className={cn("font-bold", isDarkMode ? "text-zinc-200" : "text-zinc-900")}>{sortedData.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm",
                  isDarkMode 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white" 
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-sm font-bold transition-all border",
                        currentPage === pageNum 
                          ? (isDarkMode ? "bg-white text-black border-white shadow-lg shadow-white/10" : "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20") 
                          : (isDarkMode ? "text-zinc-500 hover:bg-zinc-900 border-transparent" : "text-zinc-600 hover:bg-white hover:border-zinc-200 border-transparent")
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm",
                  isDarkMode 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white" 
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
