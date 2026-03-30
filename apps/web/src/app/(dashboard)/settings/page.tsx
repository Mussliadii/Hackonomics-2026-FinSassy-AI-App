'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Globe, DollarSign, Trash2, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageSelector, CurrencySelector } from '@/components/ui/LocaleSwitcher';
import { useAppStore } from '@/lib/store';
import { userAPI } from '@/lib/api';
import { getDictionary, t } from '@/i18n';

export default function SettingsPage() {
  const { language, currency } = useAppStore();
  const dict = getDictionary(language);

  const [tone, setTone] = useState('spicy');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [personality, setPersonality] = useState('rizky');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updatePreferences({
        language,
        currency,
        tone_preference: tone,
        personality,
        notify_morning: notifications,
        savings_target: savingsTarget ? parseInt(savingsTarget) : undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await userAPI.deleteData();
      useAppStore.getState().clearTokens();
      window.location.href = '/login';
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon size={24} className="text-brand-primary" />
        <h1 className="text-2xl font-display font-bold">{t(dict, 'settings.title')}</h1>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm"
        >
          <CheckCircle size={16} />
          {t(dict, 'settings.saved')}
        </motion.div>
      )}

      {/* Language & Currency */}
      <Card>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Globe size={18} />
          {t(dict, 'settings.preferences')}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-slate-400 mb-3 block font-medium">{t(dict, 'settings.language')}</label>
            <LanguageSelector />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-3 block font-medium">{t(dict, 'settings.currency')}</label>
            <CurrencySelector />
          </div>
        </div>
      </Card>

      {/* Roast & Personality */}
      <Card>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <User size={18} />
          {t(dict, 'settings.profile')}
        </h2>

        <div className="space-y-6">
          {/* Tone */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block font-medium">{t(dict, 'settings.tone')}</label>
            <div className="flex gap-2">
              {(['mild', 'spicy', 'extra'] as const).map((toneOption) => (
                <button
                  key={toneOption}
                  onClick={() => setTone(toneOption)}
                  className={`flex-1 py-2 rounded-xl border text-sm transition-all duration-200
                    ${tone === toneOption
                      ? 'border-brand-primary/50 bg-brand-primary/10 text-brand-primary'
                      : 'border-white/[0.06] text-slate-500 hover:border-white/[0.15]'}`}
                >
                  {t(dict, `roast.${toneOption}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block font-medium">{t(dict, 'settings.personality')}</label>
            <div className="flex gap-3">
              {[
                { id: 'rizky', emoji: '🔥', name: 'Rizky' },
                { id: 'dinda', emoji: '💜', name: 'Dinda' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                    ${personality === p.id
                      ? 'border-brand-primary/50 bg-brand-primary/10'
                      : 'border-white/[0.06] hover:border-white/[0.15]'}`}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="font-medium">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Savings Target */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block font-medium">{t(dict, 'settings.savingsTarget')}</label>
            <input
              type="number"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              className="input-field w-full"
              placeholder="1000"
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300">{t(dict, 'settings.notifications')}</label>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                notifications ? 'bg-brand-primary' : 'bg-white/[0.08]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full mt-6"
          onClick={handleSave}
          loading={saving}
        >
          {t(dict, 'common.save')}
        </Button>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/15">
        <h2 className="text-lg font-display font-semibold text-red-400 mb-4 flex items-center gap-2">
          <Trash2 size={18} />
          {t(dict, 'settings.deleteData')}
        </h2>
        <p className="text-sm text-slate-400 mb-4">{t(dict, 'settings.deleteWarning')}</p>

        {!showDelete ? (
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            {t(dict, 'settings.deleteData')}
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDelete}>
              {t(dict, 'common.confirm')}
            </Button>
            <Button variant="secondary" onClick={() => setShowDelete(false)}>
              {t(dict, 'common.cancel')}
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
