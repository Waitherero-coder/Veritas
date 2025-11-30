import { useState, useEffect } from 'react';
import { CaseFile, EvidenceItem, supabase } from '../lib/supabase';
import { ArrowLeft, Upload, Image, FileText, Mic, Video, AlertTriangle, Clock, Trash2, FileText as FileIcon } from 'lucide-react';
import { EvidenceUpload } from './EvidenceUpload';
import { EvidenceTimeline } from './EvidenceTimeline';
import jsPDF from 'jspdf';

type Props = {
  caseFile: CaseFile;
  onBack: () => void;
};

export function CaseDetail({ caseFile, onBack }: Props) {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadEvidence();
  }, [caseFile.id]);

  const loadEvidence = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('case_id', caseFile.id)
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setEvidence(data);
    }
    setLoading(false);
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    loadEvidence();
  };

  const handleDeleteCase = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from('case_files')
      .delete()
      .eq('id', caseFile.id);

    setDeleting(false);

    if (error) {
      alert(`Error deleting case: ${error.message}`);
      return;
    }

    alert('Case deleted successfully');
    onBack();
  };

  // --- PDF Export ---
  const exportPDF = () => {
    if (evidence.length === 0) {
      alert('No evidence to export.');
      return;
    }

    const doc = new jsPDF();
    doc.text('Veritas Case File', 10, 10);

    evidence.forEach((item, idx) => {
      const y = 20 + idx * 10;
      const text = item.extracted_text || '(No text)';
      doc.text(`${item.uploaded_at}: ${text}`, 10, y);
    });

    doc.text('Next Steps: Contact GBV Hotline 1195', 10, 20 + evidence.length * 10 + 10);
    doc.save(`case-${caseFile.id}.pdf`);
  };
  // --- End PDF Export ---

  const threatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Cases</span>
        </button>

        {/* PDF Export Button */}
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <FileIcon size={16} />
          Export PDF
        </button>
      </div>

      {/* Case Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{caseFile.title}</h1>
            {caseFile.description && <p className="text-slate-600">{caseFile.description}</p>}
          </div>
          <div className="flex flex-col items-end gap-3">
            <span
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                caseFile.status === 'draft'
                  ? 'bg-slate-100 text-slate-700'
                  : caseFile.status === 'active'
                  ? 'bg-blue-100 text-blue-700'
                  : caseFile.status === 'submitted'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {caseFile.status}
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <Trash2 size={16} />
              Delete Case
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Created {new Date(caseFile.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <span>{evidence.length} evidence items</span>
          </div>
        </div>

        {caseFile.social_media_platforms && caseFile.social_media_platforms.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Platforms Involved</p>
            <div className="flex flex-wrap gap-2">
              {caseFile.social_media_platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Evidence Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{evidence.length}</p>
              <p className="text-sm text-slate-600">Total Evidence</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {evidence.filter((e) => e.harm_detected).length}
              </p>
              <p className="text-sm text-slate-600">Harmful Content</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Image size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {evidence.filter((e) => e.file_type === 'image').length}
              </p>
              <p className="text-sm text-slate-600">Screenshots</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Evidence */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Evidence Timeline</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
        >
          <Upload size={20} />
          Upload Evidence
        </button>
      </div>

      {showUpload && (
        <EvidenceUpload
          caseId={caseFile.id}
          onComplete={handleUploadComplete}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Case?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{caseFile.title}"? This action cannot be undone and all associated evidence will be deleted.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCase}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <EvidenceTimeline evidence={evidence} loading={loading} />
    </div>
  );
}
