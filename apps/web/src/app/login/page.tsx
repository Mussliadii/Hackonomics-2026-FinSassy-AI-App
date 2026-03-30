'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { getDictionary, t } from '@/i18n';
import { LanguageSelector, CurrencySelector } from '@/components/ui/LocaleSwitcher';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { language, setTokens } = useAppStore();
  const dict = getDictionary(language);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login({ email, password });
      setTokens(res.data.access_token, res.data.refresh_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left panel - brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between">
        {/* Gradient background with animated shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold text-white shadow-lg">
              F$
            </div>
            <h1 className="text-2xl font-display font-bold text-white">FinSassy AI</h1>
          </div>
          <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
            {t(dict, 'common.tagline')}
          </h2>
          <p className="text-white/70 text-lg max-w-md">
            {t(dict, 'auth.signupSubtitle')}
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {[
            { emoji: '🔥', text: 'AI-powered spending roasts' },
            { emoji: '📊', text: 'Smart financial insights' },
            { emoji: '🎮', text: 'Gamified financial learning' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-4 text-white/90"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl">
                {feature.emoji}
              </div>
              <span className="text-lg font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        <p className="relative z-10 text-white/40 text-sm">Hackonomics International 2026</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-lg font-bold shadow-lg shadow-brand-primary/25">
              F$
            </div>
            <h1 className="text-xl font-bold gradient-text">FinSassy AI</h1>
          </div>

          <h2 className="text-3xl font-display font-bold mb-2">{t(dict, 'auth.loginTitle')}</h2>
          <p className="text-slate-500 mb-8">
            {t(dict, 'auth.signupSubtitle')}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={loading}>
              {t(dict, 'auth.login')}
              <ArrowRight size={18} />
            </Button>
          </form>

          <p className="text-center text-slate-500 mt-8 text-sm">
            {t(dict, 'auth.noAccount')}{' '}
            <Link href="/signup" className="text-brand-primary hover:text-brand-secondary transition-colors font-semibold">
              {t(dict, 'auth.signup')}
            </Link>
          </p>

          {/* Language selector */}
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <p className="text-xs text-slate-500 mb-3 font-medium">{t(dict, 'settings.language')}</p>
            <LanguageSelector />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
