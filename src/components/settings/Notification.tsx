import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, UserPreferences } from '../../lib/supabase';
import { Bell, Mail, MessageSquare, Save, AlertCircle } from 'lucide-react';

export function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    email_notifications: true,
    sms_notifications: false,
    notification_frequency: 'immediate'
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setPreferences(data);
    } else if (!data) {
      await supabase.from('user_preferences').insert({
        user_id: user.id,
        theme: 'light',
        email_notifications: true,
        sms_notifications: false,
        notification_frequency: 'immediate'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user!.id,
          email_notifications: preferences.email_notifications,
          sms_notifications: preferences.sms_notifications,
          notification_frequency: preferences.notification_frequency
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Notification preferences updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
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
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <Bell size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage how you receive alerts</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                  <Mail size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Email Notifications</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Receive updates about your cases via email
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications}
                  onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-emerald-600 peer-focus:ring-2 peer-focus:ring-emerald-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                  <MessageSquare size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">SMS Notifications</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Receive urgent alerts via text message
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences.sms_notifications}
                  onChange={(e) => setPreferences({ ...preferences, sms_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-emerald-600 peer-focus:ring-2 peer-focus:ring-emerald-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Notification Frequency
            </label>
            <div className="space-y-2">
              {[
                { value: 'immediate', label: 'Immediate', description: 'Get notified right away' },
                { value: 'daily', label: 'Daily Digest', description: 'Once per day summary' },
                { value: 'weekly', label: 'Weekly Summary', description: 'Once per week summary' }
              ].map((option) => (
                <label key={option.value} className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={preferences.notification_frequency === option.value}
                    onChange={(e) => setPreferences({ ...preferences, notification_frequency: e.target.value as 'immediate' | 'daily' | 'weekly' })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-slate-900 dark:text-white">{option.label}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
