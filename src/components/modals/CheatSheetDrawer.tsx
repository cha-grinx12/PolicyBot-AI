import React, { useState } from 'react';
import { Pin, X, Copy, Check, Trash2, FileText, Search, Sparkles, MapPin } from 'lucide-react';
import { ImportantMessage, Policy } from '../../types';

interface CheatSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cheatSheetItems: ImportantMessage[];
  onRemoveItem: (id: string) => void;
  onOpenCitation: (policyTitle: string, querySnippet?: string) => void;
  onNavigateToFloorMap?: (zoneId?: string) => void;
}

export const CheatSheetDrawer: React.FC<CheatSheetDrawerProps> = ({
  isOpen,
  onClose,
  cheatSheetItems = [],
  onRemoveItem,
  onOpenCitation,
  onNavigateToFloorMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const safeItems = Array.isArray(cheatSheetItems) ? cheatSheetItems : [];
  const filteredItems = safeItems.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.text.toLowerCase().includes(term) ||
      (item.origQuestion && item.origQuestion.toLowerCase().includes(term)) ||
      item.citations?.some((c) => c.policyTitle.toLowerCase().includes(term))
    );
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Side Panel */}
      <aside className="relative w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Pin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>My Policy Cheat-Sheet</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {cheatSheetItems.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Critical labor rates, emergency leave windows & HR desk access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your saved cheat-sheet cards..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Pin className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-400">No pinned items found</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Click the Pin icon (<Pin className="w-3 h-3 inline text-amber-400" />) on any PolicyBot answer to save critical rules here for quick reference.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl space-y-2.5 transition shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" />
                      <span>{item.savedAt || 'Pinned Card'}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopy(item.id, item.text)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Copy response"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Unpin from cheat-sheet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.origQuestion && (
                  <p className="text-[11px] text-indigo-300 font-semibold italic">
                    Q: &ldquo;{item.origQuestion}&rdquo;
                  </p>
                )}

                <p className="text-xs text-slate-200 leading-relaxed">{item.text}</p>

                {item.citations && item.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] text-slate-400">Cited Clause:</span>
                    {item.citations.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onOpenCitation(c.policyTitle, c.snippet || item.text)}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold transition active:scale-95"
                      >
                        <FileText className="w-3 h-3 text-indigo-400" />
                        <span>[📄 {c.policyTitle}]</span>
                      </button>
                    ))}
                  </div>
                )}

                {item.floorMapTrigger && onNavigateToFloorMap && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateToFloorMap(item.floorMapTrigger?.zoneId);
                        onClose();
                      }}
                      className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{item.floorMapTrigger.actionLabel} &rarr;</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 text-center shrink-0">
          ⭐ Pinned cheat-sheet cards are saved locally and persist across browser reloads.
        </div>
      </aside>
    </div>
  );
};
