import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Settings as SettingsIcon, User, Lock, Bell, Database, Moon, Sun, ChevronLeft } from 'lucide-react';
import { AccountSettings } from './settings/Account';
import { ProfileSettings } from './settings/Profile';
import { SecuritySettings } from './settings/Security';
import { NotificationSettings } from './settings/Notification';
import { DataManagement } from './settings/DataManagement';

type SettingsTab = 'account' | 'profile' | 'security' | 'notifications' | 'data';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: Lock, description: 'Email & password settings' },
    { id: 'profile' as const, label: 'Profile', icon: User, description: 'Personal information' },
    { id: 'security' as const, label: 'Security', icon: SettingsIcon, description: 'Account security' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Alert preferences' },
    { id: 'data' as const, label: 'Data Management', icon: Database, description: 'Export & import data' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account and preferences</p>
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={20} className="text-slate-700 dark:text-slate-300" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={20} className="text-slate-700 dark:text-slate-300" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon size={20} className={`mt-0.5 flex-shrink-0 ${
                        isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${isActive ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                          {tab.label}
                        </div>
                        <div className={`text-xs mt-0.5 ${
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'data' && <DataManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}
