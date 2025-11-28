import { CaseFile } from '../lib/supabase';
import { FileText, Clock, AlertCircle } from 'lucide-react';

type Props = {
  cases: CaseFile[];
  loading: boolean;
  onSelectCase: (caseFile: CaseFile) => void;
};

export function CaseList({ cases, loading, onSelectCase }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No cases yet</h3>
        <p className="text-slate-600 mb-6">
          Create your first case to start organizing evidence
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'submitted':
        return 'bg-emerald-100 text-emerald-700';
      case 'archived':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((caseFile) => (
        <button
          key={caseFile.id}
          onClick={() => onSelectCase(caseFile)}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <FileText size={24} className="text-emerald-600" />
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                caseFile.status
              )}`}
            >
              {caseFile.status}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
            {caseFile.title}
          </h3>

          {caseFile.description && (
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
              {caseFile.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{new Date(caseFile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
