'use client';

import { useAppStore } from '@/lib/store';
import { getDictionary, t } from '@/i18n';
import { Globe, DollarSign } from 'lucide-react';

const LANGUAGES = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'id' as const, name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'zh' as const, name: '中文简体', flag: '🇨🇳' },
];

const CURRENCIES = [
  { code: 'USD' as const, symbol: '$', name: 'US Dollar' },
  { code: 'IDR' as const, symbol: 'Rp', name: 'Rupiah' },
  { code: 'CNY' as const, symbol: '¥', name: 'Yuan' },
];

export function LanguageSelector({ onSelect }: { onSelect?: () => void }) {
  const { language, setLanguage } = useAppStore();

  return (
    <div className="flex gap-2">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => {
            setLanguage(lang.code);
            onSelect?.();
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all duration-200 text-sm
            ${language === lang.code
              ? 'border-brand-primary/50 bg-brand-primary/10 text-white shadow-sm shadow-brand-primary/10'
              : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/[0.15] hover:text-white'
            }`}
        >
          <span>{lang.flag}</span>
          <span className="font-medium">{lang.name}</span>
        </button>
      ))}
    </div>
  );
}

export function CurrencySelector({ onSelect }: { onSelect?: () => void }) {
  const { currency, setCurrency } = useAppStore();

  return (
    <div className="flex gap-2">
      {CURRENCIES.map((cur) => (
        <button
          key={cur.code}
          onClick={() => {
            setCurrency(cur.code);
            onSelect?.();
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all duration-200 text-sm
            ${currency === cur.code
              ? 'border-brand-primary/50 bg-brand-primary/10 text-white shadow-sm shadow-brand-primary/10'
              : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/[0.15] hover:text-white'
            }`}
        >
          <span className="font-mono font-bold">{cur.symbol}</span>
          <span className="font-medium">{cur.code}</span>
        </button>
      ))}
    </div>
  );
}

export function QuickLanguageSwitcher() {
  const { language, setLanguage } = useAppStore();
  const current = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-sm text-slate-500 hover:text-white transition-all duration-200">
        <Globe size={14} />
        <span>{current?.flag}</span>
      </button>
      <div className="absolute right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50 min-w-[160px] py-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2.5 px-3.5 py-2 w-full text-left text-sm transition-colors
              ${language === lang.code ? 'text-brand-primary bg-brand-primary/[0.06]' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
          >
            <span>{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
