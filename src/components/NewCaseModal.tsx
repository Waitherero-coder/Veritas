import { useState } from 'react';
import { X, FolderPlus, Loader } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, platforms: string[]) => Promise<void>;
};

const SOCIAL_MEDIA_PLATFORMS = [
  'Instagram',
  'Facebook',
  'Twitter/X',
  'TikTok',
  'WhatsApp',
  'Telegram',
  'Discord',
  'Reddit',
  'Snapchat',
  'Email',
  'SMS',
  'Dating Apps',
  'Other'
];

export function NewCaseModal({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onSubmit(title, description, selectedPlatforms);
    setLoading(false);
    setTitle('');
    setDescription('');
    setSelectedPlatforms([]);
    onClose();
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderPlus size={20} className="text-emerald-600" />
            Create New Case
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Case Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Harassment on Instagram"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Social Media Platforms
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_MEDIA_PLATFORMS.map(platform => (
                <label key={platform} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}