'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Share2, Copy, Clock, ChevronDown, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { roastAPI } from '@/lib/api';
import { getDictionary, t } from '@/i18n';

export default function RoastPage() {
  const { language, currency } = useAppStore();
  const dict = getDictionary(language);

  const [tone, setTone] = useState<'mild' | 'spicy' | 'extra'>('spicy');
  const [periodDays, setPeriodDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ roast_text: string; micro_tip: string; id: string } | null>(null);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const tones = [
    { value: 'mild' as const, label: t(dict, 'roast.mild'), bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    { value: 'spicy' as const, label: t(dict, 'roast.spicy'), bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
    { value: 'extra' as const, label: t(dict, 'roast.extra'), bg: 'bg-red-500/10 border-red-500/30 text-red-400' },
  ];

  const periods = [
    { value: 7, label: t(dict, 'roast.last7days') },
    { value: 30, label: t(dict, 'roast.last30days') },
    { value: 90, label: t(dict, 'roast.last90days') },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await roastAPI.generate({ period_days: periodDays, tone });
      setResult(res.data);
    } catch (err) {
      setResult({
        id: 'demo',
        roast_text: language === 'id'
          ? '🔥 Belum ada data transaksi untuk di-roast! Tambahkan pengeluaranmu dulu, baru kita ngobrol.'
          : language === 'zh'
          ? '🔥 还没有交易数据可以吐槽！先添加你的消费记录吧。'
          : '🔥 No transaction data to roast yet! Add some spending first, then we\'ll talk.',
        micro_tip: language === 'id'
          ? 'Mulai catat pengeluaran harianmu. Kesadaran adalah langkah pertama!'
          : language === 'zh'
          ? '开始记录你的日常消费。意识是第一步！'
          : 'Start tracking your daily expenses. Awareness is the first step!',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.roast_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async (platform: string) => {
    if (!result) return;
    const text = encodeURIComponent(`${result.roast_text}\n\n— FinSassy AI 🔥`);
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }
    if (result.id !== 'demo') {
      try { await roastAPI.share(result.id, platform); } catch {}
    }
  };

  const loadHistory = async () => {
    setShowHistory(!showHistory);
    if (!showHistory && history.length === 0) {
      try {
        const res = await roastAPI.history();
        setHistory(res.data);
      } catch {}
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-3xl font-display font-bold mb-2"
        >
          {t(dict, 'roast.title')}
        </motion.h1>
        <p className="text-slate-500">{t(dict, 'roast.subtitle')}</p>
      </div>

      {/* Controls */}
      <Card>
        {/* Tone selector */}
        <div className="mb-6">
          <label className="text-sm text-slate-400 mb-3 block font-medium">{t(dict, 'roast.tone')}</label>
          <div className="flex gap-3">
            {tones.map((toneOption) => (
              <button
                key={toneOption.value}
                onClick={() => setTone(toneOption.value)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all duration-200
                  ${tone === toneOption.value
                    ? toneOption.bg
                    : 'border-white/[0.06] text-slate-500 hover:border-white/[0.15]'
                  }`}
              >
                {toneOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period */}
        <div className="mb-6">
          <label className="text-sm text-slate-400 mb-3 block font-medium">{t(dict, 'roast.period')}</label>
          <div className="flex gap-3">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodDays(p.value)}
                className={`flex-1 py-2.5 rounded-xl border text-sm transition-all duration-200
                  ${periodDays === p.value
                    ? 'border-brand-primary/50 bg-brand-primary/10 text-brand-primary'
                    : 'border-white/[0.06] text-slate-500 hover:border-white/[0.15]'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleGenerate}
          loading={loading}
        >
          <Flame size={20} />
          {loading ? t(dict, 'roast.generating') : t(dict, 'roast.generate')}
        </Button>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card>
              <div className="prose prose-invert max-w-none">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg leading-relaxed whitespace-pre-wrap"
                >
                  {result.roast_text}
                </motion.p>
              </div>

              {/* Micro tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-gradient-to-r from-brand-primary/[0.08] to-brand-secondary/[0.08] border border-brand-primary/15 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb size={18} className="text-brand-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-brand-primary mb-1">{t(dict, 'roast.microTip')}</p>
                    <p className="text-sm text-slate-300">{result.micro_tip}</p>
                  </div>
                </div>
              </motion.div>

              {/* Share actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleShare('whatsapp')}>
                  <Share2 size={14} />
                  {t(dict, 'roast.shareWhatsapp')}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleShare('twitter')}>
                  <Share2 size={14} />
                  {t(dict, 'roast.shareTwitter')}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy size={14} />
                  {copied ? '✓' : t(dict, 'roast.copyText')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <div>
        <button
          onClick={loadHistory}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <Clock size={16} />
          {t(dict, 'roast.history')}
          <ChevronDown size={16} className={`transition-transform ${showHistory ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              {history.length > 0 ? (
                history.map((r, i) => (
                  <Card key={i} className="p-4">
                    <p className="text-sm text-slate-300 line-clamp-3">{r.roast_text as string}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span>{r.tone as string}</span>
                      <span>•</span>
                      <span>{new Date(r.created_at as string).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-4">{t(dict, 'common.noData')}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
