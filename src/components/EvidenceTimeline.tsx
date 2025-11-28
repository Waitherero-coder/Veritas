import { EvidenceItem } from '../lib/supabase';
import { Image, FileText, Mic, Video, AlertTriangle, Clock } from 'lucide-react';

type Props = {
  evidence: EvidenceItem[];
  loading: boolean;
};

export function EvidenceTimeline({ evidence, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No evidence yet</h3>
        <p className="text-slate-600">Upload your first piece of evidence to get started</p>
      </div>
    );
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image size={20} className="text-emerald-600" />;
      case 'audio':
        return <Mic size={20} className="text-blue-600" />;
      case 'video':
        return <Video size={20} className="text-purple-600" />;
      default:
        return <FileText size={20} className="text-slate-600" />;
    }
  };

  const getThreatBadge = (level: string) => {
    if (level === 'none') return null;

    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
          colors[level as keyof typeof colors]
        }`}
      >
        <AlertTriangle size={14} />
        {level.toUpperCase()} THREAT
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {evidence.map((item, index) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getFileIcon(item.file_type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Evidence #{evidence.length - index}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{new Date(item.uploaded_at).toLocaleString()}</span>
                    </div>
                    <span className="capitalize">{item.file_type}</span>
                  </div>
                </div>

                {getThreatBadge(item.threat_level)}
              </div>

              {item.extracted_text && (
                <div className="bg-slate-50 rounded-lg p-4 mb-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">Extracted Content:</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {item.extracted_text}
                  </p>
                </div>
              )}

              {item.harm_detected && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">Harmful content detected.</span> This evidence
                    contains threatening or abusive language.
                  </p>
                </div>
              )}

              {item.file_type === 'image' && (
                <div className="mt-3">
                  <img
                    src={item.file_url}
                    alt="Evidence"
                    className="rounded-lg max-h-64 object-contain border border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
