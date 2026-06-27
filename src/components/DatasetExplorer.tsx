import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, Search, ChevronRight, ChevronLeft, Database, 
  AlertTriangle, Cpu, Layers, Activity, CheckCircle2, 
  Filter, FileText, Check, Copy, ExternalLink, RefreshCw 
} from 'lucide-react';

interface FileMeta {
  name: string;
  size: string;
  rowCount: number;
  headers: string[];
}

export const DatasetExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('attacker_logs.csv');
  const [fileData, setFileData] = useState<{ headers: string[]; rows: any[] }>({ headers: [], rows: [] });
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingContent, setLoadingContent] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'TABLE' | 'RAW'>('TABLE');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const rowsPerPage = 12;

  // Fetch file list with metadata
  useEffect(() => {
    const fetchFileList = async () => {
      setLoadingList(true);
      setError(null);
      try {
        const res = await fetch('/api/dataset-files');
        if (!res.ok) throw new Error('Failed to retrieve system datasets');
        const data = await res.json();
        setFiles(data);
        
        // Find default file or fallback
        const defaultFile = data.find((f: FileMeta) => f.name === 'attacker_logs.csv') || data[0];
        if (defaultFile) {
          setSelectedFile(defaultFile.name);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading dataset metadata');
      } finally {
        setLoadingList(false);
      }
    };

    fetchFileList();
  }, []);

  // Fetch selected file details and rows
  useEffect(() => {
    if (!selectedFile) return;

    const fetchFileContent = async () => {
      setLoadingContent(true);
      setExpandedRow(null);
      setCurrentPage(1);
      try {
        const res = await fetch(`/api/dataset-file/${selectedFile}`);
        if (!res.ok) throw new Error(`Failed to load content for ${selectedFile}`);
        const data = await res.json();
        setFileData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading file records');
      } finally {
        setLoadingContent(false);
      }
    };

    fetchFileContent();
  }, [selectedFile]);

  // Copy raw CSV snippet or contents
  const handleCopyRaw = () => {
    if (fileData.rows.length === 0) return;
    
    const csvHeader = fileData.headers.join(',');
    const csvRows = fileData.rows.slice(0, 50).map(row => 
      fileData.headers.map(h => row[h]).join(',')
    ).join('\n');
    
    const fullText = `${csvHeader}\n${csvRows}\n... [Truncated for Clipboard]`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Derived stats summary per file
  const renderFileSummaryStats = () => {
    if (!fileData || fileData.rows.length === 0) return null;

    if (selectedFile === 'attacker_logs.csv') {
      const highThreats = fileData.rows.filter(r => Number(r.maliciousness_score) >= 80).length;
      const avgMaliciousness = (fileData.rows.reduce((sum, r) => sum + Number(r.maliciousness_score || 0), 0) / fileData.rows.length).toFixed(1);
      const sqlThreats = fileData.rows.filter(r => r.layer === 'SQL').length;
      const sshThreats = fileData.rows.filter(r => r.layer === 'SSH').length;

      return (
        <div className="grid grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">High Risks</div>
            <div className="text-xs font-black text-red-threat">{highThreats}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">Avg Threat</div>
            <div className="text-xs font-black text-amber-neon">{avgMaliciousness}%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">SQL Vectors</div>
            <div className="text-xs font-black text-cyan-data">{sqlThreats}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">SSH Probe</div>
            <div className="text-xs font-black text-purple-400">{sshThreats}</div>
          </div>
        </div>
      );
    }

    if (selectedFile === 'deception_responses.csv') {
      const totalSuccess = fileData.rows.filter(r => r.mitigation_status === 'SUCCESS').length;
      const totalPartial = fileData.rows.filter(r => r.mitigation_status === 'PARTIAL').length;
      const avgConfusionDelta = (fileData.rows.reduce((sum, r) => sum + Number(r.confusion_delta || 0), 0) / fileData.rows.length).toFixed(1);
      const avgYield = (fileData.rows.reduce((sum, r) => sum + Number(r.intelligence_yield || 0), 0) / fileData.rows.length).toFixed(2);

      return (
        <div className="grid grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">Mitigated</div>
            <div className="text-xs font-black text-green-400">{totalSuccess}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">Partial Mit</div>
            <div className="text-xs font-black text-amber-neon">{totalPartial}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">Confusion Δ</div>
            <div className="text-xs font-black text-cyan-data">+{avgConfusionDelta}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">Intel Yield</div>
            <div className="text-xs font-black text-emerald-400">{avgYield}</div>
          </div>
        </div>
      );
    }

    if (selectedFile === 'system_telemetry.csv') {
      const avgThreat = (fileData.rows.reduce((sum, r) => sum + Number(r.threat_level || 0), 0) / fileData.rows.length).toFixed(1);
      const avgEntropy = (fileData.rows.reduce((sum, r) => sum + Number(r.entropy_rate || 0), 0) / fileData.rows.length).toFixed(2);
      const avgConfusion = (fileData.rows.reduce((sum, r) => sum + Number(r.confusion_index || 0), 0) / fileData.rows.length).toFixed(1);
      const avgDnaSync = (fileData.rows.reduce((sum, r) => sum + Number(r.dna_sync_percentage || 0), 0) / fileData.rows.length).toFixed(1);

      return (
        <div className="grid grid-cols-4 gap-2 mb-4 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">Threat Mean</div>
            <div className="text-xs font-black text-red-threat">{avgThreat}%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">Entropy Avg</div>
            <div className="text-xs font-black text-amber-neon">{avgEntropy}b</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">Confusion</div>
            <div className="text-xs font-black text-cyan-data">{avgConfusion}%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
            <div className="text-[7px] uppercase tracking-wider opacity-40 font-bold mb-0.5">DNA Sync</div>
            <div className="text-xs font-black text-green-400">{avgDnaSync}%</div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Filter rows based on search query
  const filteredRows = fileData.rows.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(query)
    );
  });

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const displayedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Formatting helpers
  const formatCell = (header: string, val: any) => {
    if (header.toLowerCase().includes('score') || header.toLowerCase().includes('threat_level') || header.toLowerCase().includes('percentage') || header.toLowerCase().includes('index')) {
      const num = Number(val);
      if (!isNaN(num)) {
        const isCritical = num >= 80;
        return (
          <span className={`font-mono font-black ${isCritical ? 'text-red-threat' : 'text-amber-neon'}`}>
            {val}
          </span>
        );
      }
    }
    if (header === 'mitigation_status') {
      const isSuccess = val === 'SUCCESS';
      return (
        <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider ${
          isSuccess ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-amber-neon/10 text-amber-neon border border-amber-neon/20'
        }`}>
          {val}
        </span>
      );
    }
    if (header === 'layer') {
      return (
        <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase ${
          val === 'SQL' ? 'bg-cyan-data/10 text-cyan-data border border-cyan-data/20' : 'bg-purple-400/10 text-purple-400 border border-purple-400/20'
        }`}>
          {val}
        </span>
      );
    }
    if (header === 'source_ip') {
      return <span className="font-mono text-[9px] text-zinc-400">{val}</span>;
    }
    if (header === 'log_id' || header === 'trigger_action_id' || header === 'session_id' || header === 'mutation_id') {
      return <span className="font-mono text-[9px] text-cyan-data tracking-wider">{val}</span>;
    }
    if (header === 'timestamp') {
      try {
        const timePart = val.split('T')[1]?.substring(0, 8) || val;
        return <span className="font-mono text-[8px] opacity-40">{timePart}</span>;
      } catch (e) {
        return <span className="font-mono text-[8px] opacity-40">{val}</span>;
      }
    }
    return <span className="truncate max-w-[120px] block text-[10px] text-zinc-300 font-medium">{val}</span>;
  };

  const getRowAccent = (row: any) => {
    if (selectedFile === 'attacker_logs.csv' && Number(row.maliciousness_score) >= 90) {
      return 'border-l-2 border-l-red-threat bg-red-threat/[0.02]';
    }
    if (selectedFile === 'deception_responses.csv' && row.mitigation_status === 'SUCCESS') {
      return 'border-l-2 border-l-green-400/40';
    }
    return 'border-l-2 border-l-transparent';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* File Dataset Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-2xl mb-4 shrink-0 overflow-x-auto select-none no-scrollbar">
        {loadingList ? (
          <div className="flex items-center gap-2 py-1 px-3 text-[10px] opacity-40 font-mono">
            <RefreshCw className="animate-spin" size={10} /> Loading system files...
          </div>
        ) : (
          files.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file.name)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                selectedFile === file.name
                  ? 'bg-amber-neon text-black font-black shadow-[0_0_15px_rgba(255,176,0,0.15)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet size={10} />
              <span>{file.name.replace('_', ' ')}</span>
              <span className={`text-[8px] font-mono px-1 py-0.2 rounded ${
                selectedFile === file.name ? 'bg-black/10 text-black/60' : 'bg-white/5 text-white/30'
              }`}>
                {file.size}
              </span>
            </button>
          ))
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-threat/10 border border-red-threat/20 rounded-xl mb-4 text-[10px] font-mono text-red-threat/90 shrink-0 flex items-center gap-2">
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      {/* Dataset Summary Cards */}
      {!loadingContent && renderFileSummaryStats()}

      {/* View Mode & Filter Controls */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" size={12} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-amber-neon/40 text-white rounded-xl pl-8 pr-3 py-1.5 text-[10px] font-medium placeholder-white/20 focus:outline-none transition-all"
          />
        </div>
        
        {/* Toggle Mode button */}
        <div className="flex bg-white/[0.02] border border-white/5 rounded-xl p-0.5 shrink-0">
          <button
            onClick={() => setViewMode('TABLE')}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
              viewMode === 'TABLE' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            GRID
          </button>
          <button
            onClick={() => setViewMode('RAW')}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
              viewMode === 'RAW' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            RAW
          </button>
        </div>
      </div>

      {/* Interactive Main Body Content */}
      <div className="flex-1 min-h-0 relative bg-black/10 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        {loadingContent ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 opacity-40">
            <RefreshCw className="animate-spin text-amber-neon" size={24} />
            <p className="text-[9px] uppercase tracking-[0.3em] font-mono font-bold text-center">Unpacking {selectedFile} records...</p>
          </div>
        ) : viewMode === 'RAW' ? (
          /* Term-style Raw CSV file dump */
          <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/60 p-4 font-mono text-[9.5px] overflow-hidden select-text text-zinc-400">
            <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2 shrink-0">
              <span className="text-zinc-500 uppercase text-[8px] tracking-widest font-black flex items-center gap-1.5"><Layers size={10} /> CSV Header Map</span>
              <button
                onClick={handleCopyRaw}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-md text-[8px] font-black uppercase transition-all flex items-center gap-1 shrink-0"
              >
                {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                {copied ? 'Copied' : 'Copy Snippet'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar whitespace-pre leading-normal pr-1 select-text scroll-smooth">
              <div className="text-amber-neon font-black sticky top-0 bg-zinc-950/80 backdrop-blur-sm py-0.5 border-b border-amber-neon/10">{fileData.headers.join(',')}</div>
              {fileData.rows.slice(0, 150).map((row, i) => (
                <div key={i} className="hover:bg-white/5 py-0.5 transition-colors">
                  <span className="text-zinc-600 select-none inline-block w-8 text-right pr-2 mr-2 border-r border-zinc-800">{i + 1}</span>
                  {fileData.headers.map(h => row[h]).join(',')}
                </div>
              ))}
              {fileData.rows.length > 150 && (
                <div className="text-zinc-600 py-2 border-t border-white/5 select-none text-center">
                  ... and {fileData.rows.length - 150} more records truncated for browser safety.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* High density interactive tabular grid interface */
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0e0e0e]/90 backdrop-blur-md z-10 border-b border-white/5 shadow-sm">
                  <tr>
                    {/* Render only first 3 headers to fit nicely in sidebar, then an action column */}
                    {fileData.headers.slice(0, 3).map((header) => (
                      <th 
                        key={header} 
                        className="p-3 text-[8.5px] uppercase font-black tracking-widest text-white/50 border-b border-white/5 font-mono"
                      >
                        {header.replace('_', ' ')}
                      </th>
                    ))}
                    <th className="p-3 text-[8.5px] uppercase font-black tracking-widest text-white/50 border-b border-white/5 text-right font-mono">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center opacity-30 text-[10px] font-mono uppercase tracking-widest">
                        No matches found
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row, rowIndex) => {
                      const absoluteIndex = (currentPage - 1) * rowsPerPage + rowIndex;
                      const isExpanded = expandedRow === absoluteIndex;

                      return (
                        <React.Fragment key={rowIndex}>
                          <tr 
                            onClick={() => setExpandedRow(isExpanded ? null : absoluteIndex)}
                            className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${getRowAccent(row)} ${
                              isExpanded ? 'bg-white/[0.03]' : ''
                            }`}
                          >
                            {/* Render value for first 3 headers */}
                            {fileData.headers.slice(0, 3).map((header) => (
                              <td key={header} className="p-3 border-b border-white/[0.03]">
                                {formatCell(header, row[header])}
                              </td>
                            ))}
                            <td className="p-3 border-b border-white/[0.03] text-right">
                              <span className="text-[10px] font-mono font-black text-cyan-data group-hover:text-amber-neon transition-colors">
                                {isExpanded ? '[-]' : '[+]'}
                              </span>
                            </td>
                          </tr>

                          {/* Row Expansion details */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={4} className="p-4 bg-black/40 border-b border-white/5 select-text">
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-mono text-[9px] leading-tight text-zinc-400"
                                >
                                  {fileData.headers.map((header) => (
                                    <div key={header} className="border-b border-white/[0.03] pb-1.5 select-text">
                                      <span className="text-zinc-500 font-bold block mb-0.5 text-[8px] uppercase tracking-wider">{header.replace('_', ' ')}</span>
                                      <span className="text-zinc-200 break-all select-text font-medium">{row[header]}</span>
                                    </div>
                                  ))}
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Micro Pagination footer inside side component */}
            <div className="p-3 border-t border-white/5 flex items-center justify-between shrink-0 bg-black/20 select-none">
              <span className="text-[8.5px] font-mono text-zinc-500 font-bold">
                PAGE <span className="text-white">{currentPage}</span> / <span className="text-white">{totalPages}</span>
                <span className="ml-2 opacity-60">({filteredRows.length} ROWS)</span>
              </span>
              
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1 bg-white/[0.03] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-white disabled:opacity-20 disabled:pointer-events-none transition-all shrink-0"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1 bg-white/[0.03] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-white disabled:opacity-20 disabled:pointer-events-none transition-all shrink-0"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
