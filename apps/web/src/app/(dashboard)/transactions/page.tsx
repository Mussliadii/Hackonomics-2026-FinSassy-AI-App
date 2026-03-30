'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Upload,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  X,
  Camera,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { transactionsAPI } from '@/lib/api';
import { getDictionary, t } from '@/i18n';
import { formatCurrency } from '@/lib/utils';

interface Transaction {
  id: string;
  raw_text: string;
  amount: number;
  type: string;
  category_id: string | null;
  transaction_date: string;
  currency: string;
}

export default function TransactionsPage() {
  const { language, currency } = useAppStore();
  const dict = getDictionary(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptForm, setReceiptForm] = useState({
    raw_text: '',
    amount: '',
    type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
  });
  const [newTx, setNewTx] = useState({
    raw_text: '',
    amount: '',
    type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await transactionsAPI.list({ per_page: 50 });
      setTransactions(res.data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transactionsAPI.create({
        raw_text: newTx.raw_text,
        amount: parseFloat(newTx.amount),
        type: newTx.type,
        transaction_date: newTx.transaction_date,
      });
      setShowAdd(false);
      setNewTx({ raw_text: '', amount: '', type: 'expense', transaction_date: new Date().toISOString().split('T')[0] });
      fetchTransactions();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await transactionsAPI.uploadCSV(file);
      fetchTransactions();
    } catch {}
  };

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setShowReceipt(true);
    setShowAdd(false);
  };

  const handleReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) return;
    setSubmitting(true);
    try {
      await transactionsAPI.uploadReceipt(
        receiptFile,
        receiptForm.raw_text || 'Receipt purchase',
        parseFloat(receiptForm.amount),
        receiptForm.type,
        receiptForm.transaction_date,
      );
      setShowReceipt(false);
      setReceiptFile(null);
      setReceiptPreview(null);
      setReceiptForm({ raw_text: '', amount: '', type: 'expense', transaction_date: new Date().toISOString().split('T')[0] });
      fetchTransactions();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-display font-bold">{t(dict, 'transactions.title')}</h1>
        <div className="flex gap-2">
          <div>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleUpload} className="hidden" />
            <Button variant="secondary" size="md" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              {t(dict, 'transactions.upload')}
            </Button>
          </div>
          <div>
            <input ref={receiptInputRef} type="file" accept="image/*" capture="environment" onChange={handleReceiptSelect} className="hidden" />
            <Button variant="secondary" size="md" onClick={() => receiptInputRef.current?.click()}>
              <Camera size={16} />
              {language === 'id' ? 'Foto Struk' : language === 'zh' ? '拍收据' : 'Receipt'}
            </Button>
          </div>
          <Button variant="primary" size="md" onClick={() => { setShowAdd(!showAdd); setShowReceipt(false); }}>
            {showAdd ? <X size={16} /> : <Plus size={16} />}
            {showAdd ? t(dict, 'common.cancel') : t(dict, 'transactions.add')}
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
          <Card>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'transactions.description')}</label>
                <input
                  value={newTx.raw_text}
                  onChange={(e) => setNewTx({ ...newTx, raw_text: e.target.value })}
                  className="input-field w-full"
                  required
                  placeholder="Coffee at Starbucks..."
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'transactions.amount')}</label>
                <input
                  type="number"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="input-field w-full"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'transactions.type')}</label>
                <select
                  value={newTx.type}
                  onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="expense">{t(dict, 'transactions.expense')}</option>
                  <option value="income">{t(dict, 'transactions.income')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="primary" className="w-full" loading={submitting}>
                  <Plus size={16} />
                  {t(dict, 'transactions.add')}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Receipt Upload Form */}
      {showReceipt && receiptPreview && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
          <Card>
            <form onSubmit={handleReceiptSubmit} className="space-y-4">
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="w-full md:w-48 shrink-0">
                  <img src={receiptPreview} alt="Receipt" className="w-full h-48 object-cover rounded-xl border border-white/[0.08]" />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'transactions.description')}</label>
                    <input
                      value={receiptForm.raw_text}
                      onChange={(e) => setReceiptForm({ ...receiptForm, raw_text: e.target.value })}
                      className="input-field w-full"
                      placeholder={language === 'id' ? 'Deskripsi pembelian...' : 'Purchase description...'}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'transactions.amount')}</label>
                    <input
                      type="number"
                      value={receiptForm.amount}
                      onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                      className="input-field w-full"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'transactions.type')}</label>
                    <select
                      value={receiptForm.type}
                      onChange={(e) => setReceiptForm({ ...receiptForm, type: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="expense">{t(dict, 'transactions.expense')}</option>
                      <option value="income">{t(dict, 'transactions.income')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" variant="primary" className="flex-1" loading={submitting}>
                      <Plus size={16} />
                      {t(dict, 'transactions.add')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setShowReceipt(false); setReceiptPreview(null); setReceiptFile(null); }}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Transaction List */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">{t(dict, 'transactions.noTransactions')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 text-xs text-slate-500 uppercase tracking-wider px-4 pb-3 border-b border-white/[0.06] font-medium">
              <div className="col-span-5">{t(dict, 'transactions.description')}</div>
              <div className="col-span-2">{t(dict, 'transactions.category')}</div>
              <div className="col-span-2">{t(dict, 'transactions.date')}</div>
              <div className="col-span-3 text-right">{t(dict, 'transactions.amount')}</div>
            </div>

            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'income' ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20' : 'bg-red-500/10 ring-1 ring-red-500/20'
                  }`}>
                    {tx.type === 'income'
                      ? <ArrowDownLeft size={14} className="text-emerald-400" />
                      : <ArrowUpRight size={14} className="text-red-400" />
                    }
                  </div>
                  <span className="text-sm truncate">{tx.raw_text}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs bg-white/[0.04] px-2.5 py-1 rounded-lg text-slate-400 border border-white/[0.06]">
                    {tx.category_id || 'Uncategorized'}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-slate-400">
                  {new Date(tx.transaction_date).toLocaleDateString()}
                </div>
                <div className={`col-span-3 text-right text-sm font-mono font-semibold ${
                  tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
