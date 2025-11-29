import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Download, Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';

export function DataManagement() {
  const { user } = useAuth();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleExportData = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const [casesData, profileData, evidenceData] = await Promise.all([
        supabase.from('case_files').select('*').eq('user_id', user!.id),
        supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle(),
        supabase
          .from('evidence_items')
          .select('*, case_files!inner(user_id)')
          .eq('case_files.user_id', user!.id)
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        user_id: user!.id,
        profile: profileData.data,
        cases: casesData.data || [],
        evidence: evidenceData.data || []
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `veritas-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.cases || !Array.isArray(importData.cases)) {
        throw new Error('Invalid import file format');
      }

      const casesToImport = importData.cases.map((caseData: { title: string; description: string; status: string; social_media_platforms: string[] }) => ({
        user_id: user!.id,
        title: caseData.title,
        description: caseData.description,
        status: caseData.status || 'draft',
        social_media_platforms: caseData.social_media_platforms || []
      }));

      const { error } = await supabase.from('case_files').insert(casesToImport);

      if (error) throw error;

      setMessage({ type: 'success', text: `Successfully imported ${casesToImport.length} case(s)!` });
    } catch (error) {
      setMessage({ type: 'error', text: `Import failed: ${(error as Error).message}` });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <Database size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Data Management</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Export and import your data securely</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                  <Download size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Export Your Data</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Download all your cases and evidence in JSON format. This includes your profile, case files, and evidence metadata.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleExportData}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              {loading ? 'Exporting...' : 'Export My Data'}
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                  <Upload size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Import / Restore Data</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Import previously exported data or restore from a backup. Only JSON files exported from Veritas are supported.
                  </p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        <strong>Note:</strong> Importing will add cases to your account. Existing cases will not be modified or deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer inline-flex">
              <Upload size={18} />
              <span>{loading ? 'Importing...' : 'Import Data'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <div className="flex items-start gap-3">
              <Database size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-2">Data Privacy & Security</p>
                <ul className="space-y-1 list-disc list-inside ml-2">
                  <li>Your data is encrypted both in transit and at rest</li>
                  <li>Export files contain sensitive information - store them securely</li>
                  <li>We recommend keeping regular backups of important cases</li>
                  <li>Exported files can be re-imported to any Veritas account</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
