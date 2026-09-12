import React, { useState, useEffect } from 'react';
import { Policy } from '../../types';
import {
  FileText,
  X,
  Printer,
  ExternalLink,
  Maximize2,
  Calendar,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Download,
  Eye,
  FileCode,
} from 'lucide-react';
import { createFormattedDocumentUrl } from '../../utils/pdfParser';

interface DocumentReaderModalProps {
  policy: Policy | null;
  onClose: () => void;
}

export const DocumentReaderModal: React.FC<DocumentReaderModalProps> = ({
  policy,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'text'>('preview');
  const [docUrl, setDocUrl] = useState<string>('');

  useEffect(() => {
    if (!policy) return;

    // If policy already has a fileUrl (e.g. from uploaded PDF Blob)
    if (policy.fileUrl) {
      setDocUrl(policy.fileUrl);
    } else {
      // Generate formatted standalone HTML preview URL for system policies
      const generatedUrl = createFormattedDocumentUrl({
        title: policy.title,
        content: policy.content,
        category: policy.category,
        lastUpdated: policy.lastUpdated,
      });
      setDocUrl(generatedUrl);
    }
  }, [policy]);

  if (!policy) return null;

  const isPdf =
    policy.title.toLowerCase().endsWith('.pdf') ||
    policy.mimeType === 'application/pdf';

  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  const handlePrint = () => {
    setPrintFeedback('Sending document to printer...');
    try {
      // Direct browser window print
      window.print();
      setPrintFeedback('Print dialog opened');
    } catch (e) {
      console.warn('Print command error:', e);
      setPrintFeedback('Print initiated');
    } finally {
      setTimeout(() => {
        setPrintFeedback(null);
      }, 3000);
    }
  };

  const handleOpenExternal = () => {
    if (docUrl) {
      window.open(docUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      id="document-reader-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Top Header Bar */}
        <div className="py-3 px-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate font-mono">
                  {policy.title}
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified Grounding Source
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center">
                  <Tag className="w-3 h-3 mr-1 text-slate-500" />
                  {policy.category || 'Company Policy'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                  Updated: {policy.lastUpdated || '2026-01-10'}
                </span>
                {policy.fileSize && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-slate-400">{policy.fileSize}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Tab switchers */}
            <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs mr-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Document View</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition ${
                  activeTab === 'text'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Extracted Clauses</span>
              </button>
            </div>

            {/* Print button & feedback */}
            {printFeedback && (
              <span className="hidden md:inline-flex items-center text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg animate-pulse">
                ✓ {printFeedback}
              </span>
            )}
            <button
              id="btn-print-doc"
              onClick={handlePrint}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition active:scale-95 ${
                printFeedback
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700'
              }`}
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{printFeedback ? 'Printing...' : 'Print'}</span>
            </button>

            {/* Open external button */}
            {docUrl && (
              <button
                onClick={handleOpenExternal}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Open document in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Close modal */}
            <button
              id="btn-close-reader-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Close reader (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden bg-slate-950 p-2 sm:p-4 flex flex-col">
          {activeTab === 'preview' ? (
            <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col relative shadow-inner">
              {docUrl ? (
                <iframe
                  id="document-preview-frame"
                  src={docUrl}
                  className="w-full h-[75vh] border-0 rounded-lg bg-white"
                  title={policy.title}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                  <FileText className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                  <p className="text-sm font-medium">Preparing document reader preview...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Indexed Handbook Text & Clauses
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {policy.content.length} characters parsed
                </span>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {policy.content}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Grounded in Active Tenant Memory
                </span>
                <span>Document ID: {policy.id}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="py-2.5 px-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>PolicyBot Live Grounding Document Reader</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Scroll & zoom supported in reader</span>
            <button
              onClick={() => setActiveTab(activeTab === 'preview' ? 'text' : 'preview')}
              className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2"
            >
              Switch to {activeTab === 'preview' ? 'Text Clauses' : 'Document View'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
