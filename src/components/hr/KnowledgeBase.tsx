import React, { useState, useRef } from 'react';
import { Policy } from '../../types';
import {
  FileText,
  Search,
  Plus,
  FileCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
  X,
  Tag,
  UploadCloud,
  FileUp,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Eye,
  Printer,
} from 'lucide-react';
import { readMultiFormatDocumentWithFileReader, ParsedPdfPolicy } from '../../utils/pdfParser';
import { DocumentReaderModal } from '../modals/DocumentReaderModal';

interface KnowledgeBaseProps {
  policies: Policy[];
  onAddPolicy: (policy: Omit<Policy, 'id'>) => void;
  onDeletePolicy: (id: string) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  policies = [],
  onAddPolicy,
  onDeletePolicy,
}) => {
  const safePolicies = Array.isArray(policies) ? policies : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(safePolicies[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [previewDocPolicy, setPreviewDocPolicy] = useState<Policy | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ingestion review modal state for uploaded PDF
  const [pendingPdf, setPendingPdf] = useState<ParsedPdfPolicy | null>(null);

  // Manual policy form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General Policy');
  const [newContent, setNewContent] = useState('');

  const filteredPolicies = safePolicies.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleTriggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const processUploadedFile = async (file: File) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isSupported =
      lowerName.endsWith('.pdf') ||
      lowerName.endsWith('.doc') ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.txt') ||
      file.type === 'application/pdf' ||
      file.type === 'text/plain' ||
      file.type.includes('word');

    if (!isSupported) {
      setUploadErrorMsg('Please upload a valid document (.pdf, .doc, .docx, or .txt).');
      setTimeout(() => setUploadErrorMsg(null), 4000);
      return;
    }

    setIsUploading(true);
    setUploadErrorMsg(null);

    try {
      const parsed = await readMultiFormatDocumentWithFileReader(file);
      setPendingPdf(parsed);
      setIsUploading(false);
    } catch (err: any) {
      setIsUploading(false);
      setUploadErrorMsg(err?.message || 'Failed to read document file.');
      setTimeout(() => setUploadErrorMsg(null), 4000);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleConfirmIngestPendingPdf = () => {
    if (!pendingPdf) return;

    const newPolicyData: Omit<Policy, 'id'> = {
      companyId: 'acme',
      title: pendingPdf.title,
      content: pendingPdf.content,
      category: pendingPdf.category,
      fileSize: pendingPdf.fileSize,
      fileUrl: pendingPdf.fileUrl,
      mimeType: pendingPdf.mimeType,
      sourceType: 'uploaded',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onAddPolicy(newPolicyData);
    setUploadSuccessMsg(`Successfully uploaded and indexed "${pendingPdf.title}" into AI search engine.`);
    setTimeout(() => setUploadSuccessMsg(null), 5000);
    setPendingPdf(null);
  };

  const handleCreateManualPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    let formattedTitle = newTitle.trim();
    if (!formattedTitle.toLowerCase().endsWith('.pdf') && !formattedTitle.toLowerCase().endsWith('.doc')) {
      formattedTitle += '.pdf';
    }

    onAddPolicy({
      companyId: 'acme',
      title: formattedTitle,
      content: newContent.trim(),
      category: newCategory,
      fileSize: '12.4 KB',
      sourceType: 'system',
      lastUpdated: new Date().toISOString().split('T')[0],
    });

    setNewTitle('');
    setNewContent('');
    setIsAddModalOpen(false);
    setUploadSuccessMsg(`Indexed "${formattedTitle}" into knowledge base.`);
    setTimeout(() => setUploadSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for PDF Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        id="pdf-file-upload-input"
      />

      {/* Header & Upload Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Policy Knowledge Base</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative documents indexed by PolicyBot AI. Queries in Employee Chat directly cite these files.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {/* Primary File Explorer PDF Upload Button */}
          <button
            onClick={handleTriggerFilePicker}
            disabled={isUploading}
            id="btn-upload-policy-pdf"
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Reading PDF...' : 'Upload Policy PDF'}</span>
          </button>

          {/* Manual Entry Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Manual Clause</span>
          </button>
        </div>
      </div>

      {/* Success / Error Notification Banners */}
      {uploadSuccessMsg && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadSuccessMsg}</span>
          </div>
          <button onClick={() => setUploadSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {uploadErrorMsg && (
        <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadErrorMsg}</span>
          </div>
          <button onClick={() => setUploadErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop PDF Ingestion Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleTriggerFilePicker}
        className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 ring-4 ring-cyan-500/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/80'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition">
          <FileUp className="w-6 h-6 text-cyan-300" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-white mb-1">
          {isDragging ? 'Drop PDF here to parse' : 'Drag & drop official company PDF here, or browse local files'}
        </p>
        <p className="text-[11px] text-slate-400 max-w-md">
          HTML5 FileReader instantly parses clauses, extracts policy rules, and indexes content for Employee Chat citations.
        </p>
        <div className="flex items-center space-x-3 mt-3 text-[10px] text-slate-500">
          <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-300">Format: .PDF</span>
          <span>&bull;</span>
          <span>Max size: 25 MB</span>
          <span>&bull;</span>
          <span className="text-emerald-400 font-medium">Instant AI Chat Ingestion</span>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies by keyword (e.g. PTO, stipend, parental)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>
        <div className="text-xs text-slate-400 flex items-center space-x-3 w-full sm:w-auto justify-end">
          <span>Showing <strong className="text-white font-medium">{filteredPolicies.length}</strong> of {policies.length} documents</span>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400 font-semibold flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Vector Indexed
          </span>
        </div>
      </div>

      {/* Two Column Layout: List and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Document Cards List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredPolicies.map((policy) => {
            const isSelected = selectedPolicy?.id === policy.id;
            const isUploaded = policy.sourceType === 'uploaded';

            return (
              <div
                key={policy.id}
                onClick={() => setSelectedPolicy(policy)}
                className={`p-4 rounded-2xl border cursor-pointer transition relative shadow-sm ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/40'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl border ${isUploaded ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                      {isUploaded ? <FileUp className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h2 className="text-xs font-bold text-white font-mono break-all">{policy.title}</h2>
                        {isUploaded && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[9px] font-bold border border-cyan-800">
                            Uploaded
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center mt-0.5">
                        <Tag className="w-2.5 h-2.5 mr-1 text-slate-500" />
                        {policy.category || 'Company Policy'}
                        {policy.fileSize && (
                          <>
                            <span className="mx-1.5 text-slate-600">&bull;</span>
                            <span className="text-slate-400">{policy.fileSize}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {policy.content}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Updated: {policy.lastUpdated || '2026-01-01'}</span>
                  <span className="text-indigo-400 font-semibold">Preview &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Document Inspector */}
        <div className="lg:col-span-2">
          {selectedPolicy ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 h-full flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white font-mono">{selectedPolicy.title}</h3>
                        {selectedPolicy.sourceType === 'uploaded' && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 text-[10px] font-bold border border-cyan-800">
                            Local PDF Import
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                          {selectedPolicy.category || 'General'}
                        </span>
                        <span>&bull;</span>
                        <span>Company: Acme Corp</span>
                        {selectedPolicy.fileSize && (
                          <>
                            <span>&bull;</span>
                            <span>Size: {selectedPolicy.fileSize}</span>
                          </>
                        )}
                        <span>&bull;</span>
                        <span>Last modified: {selectedPolicy.lastUpdated || '2026-01-01'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      id="btn-preview-policy-doc"
                      onClick={() => setPreviewDocPolicy(selectedPolicy)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center transition active:scale-[0.98]"
                      title="Open full document reader, print, and viewer"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      <span>Preview Document</span>
                    </button>

                    {safePolicies.length > 2 && (
                      <button
                        onClick={() => {
                          onDeletePolicy(selectedPolicy.id);
                          setSelectedPolicy(safePolicies.filter((p) => p.id !== selectedPolicy.id)[0] || null);
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
                        title="Delete Policy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Box */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Verified Handbook Clause
                  </h4>
                  <div className="bg-slate-950/70 rounded-xl p-5 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedPolicy.content}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Tenant security: Locked to @acmecorp.com scope</span>
                <span className="text-emerald-400 font-medium flex items-center">
                  <FileCheck className="w-3.5 h-3.5 mr-1" /> Active in AI Knowledge Graph
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p>Select a policy to view its details</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF INGESTION REVIEW & CONFIRMATION MODAL */}
      {pendingPdf && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Review & Index PDF Document</h3>
                  <p className="text-xs text-slate-400">Parsed via HTML5 FileReader from local file explorer</p>
                </div>
              </div>
              <button
                onClick={() => setPendingPdf(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Document Filename
                  </label>
                  <input
                    type="text"
                    value={pendingPdf.title}
                    onChange={(e) => setPendingPdf({ ...pendingPdf, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Category Tag
                  </label>
                  <select
                    value={pendingPdf.category}
                    onChange={(e) => setPendingPdf({ ...pendingPdf, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Leave & Attendance">Leave & Attendance</option>
                    <option value="Healthcare & Perks">Healthcare & Perks</option>
                    <option value="Workplace & Equipment">Workplace & Equipment</option>
                    <option value="Compliance & Conduct">Compliance & Conduct</option>
                    <option value="Compensation & Perks">Compensation & Perks</option>
                    <option value="General Policy">General Policy</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">File Size: <strong className="text-white">{pendingPdf.fileSize}</strong></span>
                <span className="text-slate-400">Company: <strong className="text-white">Acme Corp</strong></span>
                <span className="text-emerald-400 font-semibold flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Ready to Index
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Extracted Policy Clauses (Indexed by Chat Engine)
                </label>
                <textarea
                  rows={6}
                  value={pendingPdf.content}
                  onChange={(e) => setPendingPdf({ ...pendingPdf, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-sans resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingPdf(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmIngestPendingPdf}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-md transition active:scale-[0.98] flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Index Policy PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Policy Modal (Manual) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Add New Policy Document</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualPolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Document Title / File Name
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Parental_Leave_Guidelines.pdf"
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                >
                  <option value="Leave & Attendance">Leave & Attendance</option>
                  <option value="Workplace & Equipment">Workplace & Equipment</option>
                  <option value="Healthcare & Perks">Healthcare & Perks</option>
                  <option value="Compliance & Conduct">Compliance & Conduct</option>
                  <option value="Compensation & Perks">Compensation & Perks</option>
                  <option value="General Policy">General Policy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Policy Content & Clause Details
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Acme Corp provides 12 weeks of fully paid parental leave for all new parents..."
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-[0.98]"
                >
                  Save & Index Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL DOCUMENT READER & VIEWER MODAL */}
      {previewDocPolicy && (
        <DocumentReaderModal
          policy={previewDocPolicy}
          onClose={() => setPreviewDocPolicy(null)}
        />
      )}
    </div>
  );
};
