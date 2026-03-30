'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  BookOpen,
} from 'lucide-react';
import { Card, MoodCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useAppStore } from '@/lib/store';
import { insightsAPI, transactionsAPI } from '@/lib/api';
import { getDictionary, t } from '@/i18n';
import { formatCurrency, getMoodEmoji } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { language, currency, mood, setMood, setFinancialScore } = useAppStore();
  const dict = getDictionary(language);

  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [digest, setDigest] = useState<Record<string, unknown> | null>(null);
  const [summary, setSummary] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, digestRes, summaryRes] = await Promise.all([
          insightsAPI.financialHealth().catch(() => null),
          insightsAPI.dailyDigest().catch(() => null),
          transactionsAPI.summary('month').catch(() => null),
        ]);

        if (healthRes?.data) {
          setHealth(healthRes.data);
          setMood(healthRes.data.mood as 'green' | 'yellow' | 'red');
          setFinancialScore(healthRes.data.score as number);
        }
        if (digestRes?.data) setDigest(digestRes.data);
        if (summaryRes?.data) setSummary(summaryRes.data);
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setMood, setFinancialScore]);

  const healthScore = (health?.score as number) || 75;
  const budgetUsed = (health?.budget_used_percentage as number) || 0;
  const savingsProgress = (health?.savings_progress_percentage as number) || 0;
  const totalExpenses = (health?.total_expenses as number) || 0;
  const totalIncome = (health?.total_income as number) || 0;
  const streakDays = (health?.streak_days as number) || 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{t(dict, 'dashboard.welcome', { name: 'User' })}</h1>
          <p className="text-slate-500 text-sm mt-1">{t(dict, 'common.tagline')}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/roast">
            <Button variant="primary" size="md">
              <Flame size={16} />
              {t(dict, 'nav.roastMe')}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Financial Health Score */}
        <motion.div variants={item}>
          <MoodCard mood={mood} className="flex items-center gap-5">
            <ProgressRing
              value={healthScore}
              size={90}
              strokeWidth={6}
              mood={mood}
              sublabel={t(dict, 'dashboard.score')}
            />
            <div>
              <p className="text-sm text-slate-400">{t(dict, 'dashboard.financialHealth')}</p>
              <p className="text-lg font-bold flex items-center gap-1.5">
                {getMoodEmoji(mood)} {t(dict, `mood.${mood}`)}
              </p>
            </div>
          </MoodCard>
        </motion.div>

        {/* Budget Used */}
        <motion.div variants={item}>
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{t(dict, 'dashboard.budgetUsed')}</span>
              <TrendingUp size={18} className={budgetUsed > 100 ? 'text-red-400' : 'text-emerald-400'} />
            </div>
            <p className="text-2xl font-bold">{budgetUsed.toFixed(0)}%</p>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                className={`h-full rounded-full ${
                  budgetUsed <= 75 ? 'bg-emerald-500' : budgetUsed <= 100 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
          </Card>
        </motion.div>

        {/* Savings Target */}
        <motion.div variants={item}>
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{t(dict, 'dashboard.savingsProgress')}</span>
              <Target size={18} className="text-brand-primary" />
            </div>
            <p className="text-2xl font-bold">{savingsProgress.toFixed(0)}%</p>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(savingsProgress, 100)}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                className="h-full rounded-full bg-brand-primary"
              />
            </div>
          </Card>
        </motion.div>

        {/* Learning Streak */}
        <motion.div variants={item}>
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{t(dict, 'dashboard.streak')}</span>
              <Zap size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold">{t(dict, 'dashboard.streakDays', { count: streakDays })}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div
                  key={d}
                  className={`h-6 flex-1 rounded-md transition-colors ${d <= streakDays ? 'bg-amber-500' : 'bg-white/[0.06]'}`}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Income/Expense + Daily Digest Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Overview */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-display font-semibold mb-4">{t(dict, 'dashboard.monthlyOverview')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/[0.08] border border-emerald-500/15 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <ArrowDownLeft size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-sm text-emerald-400 font-medium">{t(dict, 'transactions.income')}</span>
                </div>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {formatCurrency(totalIncome, currency)}
                </p>
              </div>
              <div className="bg-red-500/[0.08] border border-red-500/15 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <ArrowUpRight size={14} className="text-red-400" />
                  </div>
                  <span className="text-sm text-red-400 font-medium">{t(dict, 'transactions.expense')}</span>
                </div>
                <p className="text-xl font-bold text-red-400 mt-1">
                  {formatCurrency(totalExpenses, currency)}
                </p>
              </div>
            </div>

            {/* Spending Breakdown */}
            {summary.length > 0 && (
              <div className="mt-5 space-y-2.5">
                {summary.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-24 truncate">{cat.category as string}</span>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                    <span className="text-sm font-mono w-16 text-right text-slate-400">{(cat.percentage as number)?.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Daily Digest */}
        <motion.div variants={item}>
          <Card className="h-full flex flex-col">
            <h3 className="text-lg font-display font-semibold mb-3">{t(dict, 'dashboard.dailyDigest')}</h3>
            {digest ? (
              <>
                <p className="text-slate-300 text-sm flex-1 leading-relaxed">{digest.insight as string}</p>
                <div className="mt-4 p-4 bg-brand-primary/[0.08] border border-brand-primary/15 rounded-xl">
                  <p className="text-sm text-brand-primary font-medium leading-relaxed">💭 {digest.reflection_question as string}</p>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm">{t(dict, 'common.noData')}</p>
            )}

            <div className="mt-4 pt-4 border-t border-white/[0.06] flex gap-2">
              <Link href="/learn" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  <BookOpen size={14} />
                  {t(dict, 'learn.quiz')}
                </Button>
              </Link>
              <Link href="/roast" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  <Flame size={14} />
                  {t(dict, 'nav.roastMe')}
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Add Transaction */}
      <motion.div variants={item}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold">{t(dict, 'dashboard.quickAdd')}</h3>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">
                {t(dict, 'transactions.title')} →
              </Button>
            </Link>
          </div>
          <Link href="/transactions">
            <div className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 flex flex-col items-center justify-center hover:border-brand-primary/40 hover:bg-brand-primary/[0.03] transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
                <Plus size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">{t(dict, 'transactions.add')}</p>
            </div>
          </Link>
        </Card>
      </motion.div>
    </motion.div>
  );
}
