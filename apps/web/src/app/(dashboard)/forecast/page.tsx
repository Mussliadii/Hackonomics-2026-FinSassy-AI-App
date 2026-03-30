'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { forecastAPI } from '@/lib/api';
import { getDictionary, t } from '@/i18n';
import { formatCurrency } from '@/lib/utils';

export default function ForecastPage() {
  const { language, currency } = useAppStore();
  const dict = getDictionary(language);

  const [bills, setBills] = useState<Record<string, unknown>[]>([]);
  const [cashflow, setCashflow] = useState<{ currency: string; weeks: Record<string, unknown>[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, cashflowRes] = await Promise.all([
          forecastAPI.bills().catch(() => null),
          forecastAPI.cashflow().catch(() => null),
        ]);
        if (billsRes?.data) setBills(billsRes.data);
        if (cashflowRes?.data) setCashflow(cashflowRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">{t(dict, 'forecast.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t(dict, 'forecast.subtitle')}</p>
      </div>

      {/* Cash Flow */}
      <Card>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-brand-primary" />
          {t(dict, 'forecast.cashflow')}
        </h2>

        {cashflow && cashflow.weeks.length > 0 ? (
          <div className="space-y-3">
            {cashflow.weeks.map((week, i) => {
              const income = week.income as number;
              const expenses = week.expenses as number;
              const net = week.net as number;
              const maxVal = Math.max(income, expenses, 1);

              return (
                <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">
                      <Calendar size={14} className="inline mr-1" />
                      Week {week.week as number}
                    </span>
                    <span className={`text-sm font-semibold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-16">{t(dict, 'transactions.income')}</span>
                      <div className="flex-1 h-3 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(income / maxVal) * 100}%` }}
                          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                      <span className="text-xs font-mono w-24 text-right">{formatCurrency(income, currency)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-16">{t(dict, 'transactions.expense')}</span>
                      <div className="flex-1 h-3 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(expenses / maxVal) * 100}%` }}
                          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                          className="h-full bg-red-500 rounded-full"
                        />
                      </div>
                      <span className="text-xs font-mono w-24 text-right">{formatCurrency(expenses, currency)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">{t(dict, 'common.noData')}</p>
        )}
      </Card>

      {/* Upcoming Bills */}
      <Card>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-amber-400" />
          {t(dict, 'forecast.upcomingBills')}
        </h2>

        {bills.length > 0 ? (
          <div className="space-y-2">
            {bills.map((bill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl"
              >
                <div>
                  <p className="font-medium">{bill.bill_name as string}</p>
                  <p className="text-xs text-slate-400">
                    {t(dict, 'forecast.predictedDate')}: {bill.predicted_date as string}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(bill.predicted_amount as number, currency)}</p>
                  <p className="text-xs text-slate-400">
                    {t(dict, 'forecast.confidence')}: {((bill.confidence as number) * 100).toFixed(0)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">{t(dict, 'forecast.noBills')}</p>
        )}
      </Card>
    </motion.div>
  );
}
