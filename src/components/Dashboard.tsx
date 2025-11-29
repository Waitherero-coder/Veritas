import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CaseFile } from '../lib/supabase';
import { PanicButton } from './PanicButton';
import { CaseList } from './CaseList';
import { CaseDetail } from './CaseDetail';
import { SupportBridge } from './SupportBridge';
import { NewCaseModal } from './NewCaseModal';
import { Settings } from './Settings';
import {
  LogOut,
  Plus,
  Shield,
  LifeBuoy,
  FileText,
  Settings as SettingsIcon,
} from 'lucide-react';

type View = 'cases' | 'case-detail' | 'support' | 'settings';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>('cases');
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('case_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setCases(data);
    setLoading(false);
  };

  const handleCreateCase = () => setIsModalOpen(true);

  const handleCreateCaseSubmit = async (
    title: string,
    description: string,
    platforms: string[]
  ) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('case_files')
      .insert({
        user_id: user.id,
        title,
        description,
        status: 'draft',
        social_media_platforms: platforms,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      alert(`Error creating case: ${error.message}`);
      return;
    }

    if (data) {
      setCases([data, ...cases]);
      setSelectedCase(data);
      setView('case-detail');
      setIsModalOpen(false);
    }
  };

  const handleSelectCase = (caseFile: CaseFile) => {
    setSelectedCase(caseFile);
    setView('case-detail');
  };

  const handleBackToCases = () => {
    setView('cases');
    setSelectedCase(null);
    loadCases();
  };

  // 1. Centralized view mapping
  const views: Record<
    Exclude<View, 'case-detail'>,
    { label: string; icon: JSX.Element; component: JSX.Element }
  > = {
    cases: {
      label: 'My Cases',
      icon: <FileText size={20} />,
      component: (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">My Case Files</h2>
              <p className="text-slate-600 mt-1">
                Organize and document evidence securely
              </p>
            </div>
            <button
              onClick={handleCreateCase}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              <Plus size={20} />
              New Case
            </button>
          </div>
          <CaseList cases={cases} loading={loading} onSelectCase={handleSelectCase} />
        </div>
      ),
    },
    support: {
      label: 'Get Help',
      icon: <LifeBuoy size={20} />,
      component: <SupportBridge />,
    },
    settings: {
      label: 'Settings',
      icon: <SettingsIcon size={20} />,
      component: <Settings onBack={handleBackToCases} />,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PanicButton />

      <NewCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCaseSubmit}
      />

      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Veritas</h1>
                <p className="text-xs text-slate-500">Evidence & Justice Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Render view buttons dynamically */}
              {Object.entries(views).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  onClick={() => setView(key as View)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    view === key
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {icon}
                  <span className="font-medium">{label}</span>
                </button>
              ))}

              <button
                onClick={signOut}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'case-detail' && selectedCase ? (
          <CaseDetail caseFile={selectedCase} onBack={handleBackToCases} />
        ) : (
          views[view as Exclude<View, 'case-detail'>].component
        )}
      </main>
    </div>
  );
}
