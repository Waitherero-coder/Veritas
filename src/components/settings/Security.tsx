import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Trash2, AlertTriangle } from 'lucide-react';

export function SecuritySettings() {
  const { deleteAccount } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteAccount();
    } catch (error) {
      setError((error as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security Settings</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-slate-600 dark:text-slate-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">Data Protection</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  All your data is encrypted and stored securely. We use industry-standard security measures to protect your information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-red-200 dark:border-red-900">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <Trash2 size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Account</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Permanently delete your account and all data</p>
          </div>
        </div>

        {!showConfirm ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-300">
                  <strong>Warning:</strong> This action cannot be undone. All your cases, evidence, and personal data will be permanently deleted.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Trash2 size={18} />
              Delete My Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-300">
                  <p className="font-semibold mb-2">Are you absolutely sure?</p>
                  <p className="mb-2">This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Your profile and account data</li>
                    <li>All case files and evidence</li>
                    <li>All preferences and settings</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Type DELETE"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== 'DELETE'}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Trash2 size={18} />
                {loading ? 'Deleting...' : 'Permanently Delete Account'}
              </button>

              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText('');
                  setError('');
                }}
                disabled={loading}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
