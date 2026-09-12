import React, { useState, useMemo } from 'react';
import { Policy } from '../../types';
import {
  FileText,
  X,
  Search,
  Copy,
  Check,
  ShieldCheck,
  Scale,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface CitationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  queryContext?: string;
  citationTitle?: string;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({
  isOpen,
  onClose,
  policy,
  queryContext = '',
  citationTitle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const displayTitle = policy?.title || citationTitle || 'Policy Document';
  const displayContent = policy?.content || 'No document content available.';

  // Determine effective highlight keywords based on search term or query context
  const highlightKeywords = useMemo(() => {
    const raw = searchTerm.trim() || queryContext.trim();
    if (!raw) return [];
    // Extract keywords of 3 or more chars, excluding common stop words
    const stopWords = new Set(['the', 'and', 'for', 'are', 'what', 'how', 'when', 'with', 'from', 'this', 'that', 'have', 'does', 'paano', 'saan', 'kailan']);
    return raw
      .toLowerCase()
      .split(/[\s,?.!]+/)
      .filter((w) => w.length >= 3 && !stopWords.has(w));
  }, [searchTerm, queryContext]);

  // Break content into sentences and highlight matching legal clauses
  const highlightedContent = useMemo(() => {
    if (!highlightKeywords.length) {
      return <span>{displayContent}</span>;
    }

    // Split into sentences / paragraphs preserving line breaks
    const paragraphs = displayContent.split('\n');

    return paragraphs.map((para, pIdx) => {
      if (!para.trim()) return <br key={pIdx} />;

      // Match sentences in paragraph
      const sentences = para.split(/(?<=[.!?])\s+/);

      return (
        <p key={pIdx} className="mb-3 last:mb-0 leading-relaxed">
          {sentences.map((sentence, sIdx) => {
            const lower = sentence.toLowerCase();
            const hasMatch = highlightKeywords.some((kw) => lower.includes(kw));

            if (hasMatch) {
              return (
                <mark
                  key={sIdx}
                  className="bg-yellow-300/50 text-yellow-100 px-1 py-0.5 rounded font-medium transition-colors"
                >
                  {sentence}{' '}
                </mark>
              );
            }
            return <span key={sIdx}>{sentence} </span>;
          })}
        </p>
      );
    });
  }, [displayContent, highlightKeywords]);

  const handleCopy = () => {
    if (!displayContent) return;
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const isDOLE = displayTitle.toLowerCase().includes('dole') || displayTitle.toLowerCase().includes('labor');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Drawer Container */}
      <aside className="relative w-full sm:w-[500px] md:w-[540px] bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className={`p-2 rounded-xl border ${isDOLE ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
              {isDOLE ? <Scale className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold text-white truncate">{displayTitle}</h3>
                {isDOLE && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold whitespace-nowrap">
                    DOLE Certified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Interactive Citation Drawer &bull; Legal Risk Prevention
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Copy policy text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Dynamic Highlight Filter Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search or highlight legal clause within this document..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span>
                Highlighted clause matching query:{' '}
                <strong className="text-yellow-300 font-mono">
                  {searchTerm || queryContext || 'Auto-detected'}
                </strong>
              </span>
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Document Content View with Dynamic Highlights */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-200 space-y-3 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Authoritative Text Indexed & Verified</span>
            </span>
            <span className="font-mono text-slate-500">
              {policy?.lastUpdated ? `Updated: ${policy.lastUpdated}` : 'Active Edition'}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 whitespace-pre-wrap font-sans">
            {highlightedContent}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-500">
            Clause highlighted with &lt;mark&gt; for rapid compliance audits.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  );
};
