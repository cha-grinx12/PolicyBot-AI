import React, { useState } from 'react';
import { Policy } from '../../types';
import {
  FileText,
  Search,
  BookOpen,
  Calendar,
  ExternalLink,
  Tag,
  Eye,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { DocumentReaderModal } from '../modals/DocumentReaderModal';

interface EmployeeKnowledgeBaseProps {
  policies: Policy[];
  tenantName: string;
}

export const EmployeeKnowledgeBase: React.FC<EmployeeKnowledgeBaseProps> = ({
  policies = [],
  tenantName = 'Acme Corp',
}) => {
  const safePolicies = Array.isArray(policies) ? policies : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [readingPolicy, setReadingPolicy] = useState<Policy | null>(null);

  const categories = ['All', 'Handbook & DOLE Policy', 'Benefits', 'Security & Conduct', 'General'];

  const filteredPolicies = safePolicies.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      (policy.category && policy.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Company Knowledge Base & Policy Handbook
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse official {tenantName} workplace policies, statutory DOLE Labor Code guidelines, and employee entitlements.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center space-x-1.5 overflow-x-auto p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start sm:self-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap active:scale-[0.98] ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search policies, DOLE labor codes, PTO, benefits, or conduct guides..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
        />
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPolicies.map((policy) => (
          <div
            key={policy.id}
            onClick={() => setReadingPolicy(policy)}
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-indigo-950/30"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {policy.category || 'Policy Document'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                  {policy.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                  {policy.content}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified DOLE/HR</span>
              </span>
              <span className="text-indigo-400 font-medium flex items-center space-x-1 group-hover:underline">
                <Eye className="w-3.5 h-3.5" />
                <span>Read Full</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">No policies found matching your search.</p>
          <p className="text-xs text-slate-500 mt-1">Try searching for &quot;PTO&quot;, &quot;13th Month&quot;, or &quot;Remote Work&quot;.</p>
        </div>
      )}

      {/* Reader Modal */}
      {readingPolicy && (
        <DocumentReaderModal
          policy={readingPolicy}
          onClose={() => setReadingPolicy(null)}
        />
      )}
    </div>
  );
};
