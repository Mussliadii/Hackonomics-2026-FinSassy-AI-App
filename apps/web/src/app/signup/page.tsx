'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ChevronRight, ChevronLeft, Check, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { getDictionary, t } from '@/i18n';
import { LanguageSelector, CurrencySelector } from '@/components/ui/LocaleSwitcher';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { language, currency, setTokens } = useAppStore();
  const dict = getDictionary(language);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    personality: 'rizky',
  });
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation
  const passwordChecks = useMemo(() => {
    const pw = form.password;
    return [
      { label: language === 'id' ? 'Minimal 8 karakter' : language === 'zh' ? '至少8个字符' : 'At least 8 characters', valid: pw.length >= 8 },
      { label: language === 'id' ? 'Huruf besar (A-Z)' : language === 'zh' ? '大写字母 (A-Z)' : 'Uppercase letter (A-Z)', valid: /[A-Z]/.test(pw) },
      { label: language === 'id' ? 'Huruf kecil (a-z)' : language === 'zh' ? '小写字母 (a-z)' : 'Lowercase letter (a-z)', valid: /[a-z]/.test(pw) },
      { label: language === 'id' ? 'Angka (0-9)' : language === 'zh' ? '数字 (0-9)' : 'Number (0-9)', valid: /[0-9]/.test(pw) },
      { label: language === 'id' ? 'Karakter spesial (!@#$...)' : language === 'zh' ? '特殊字符 (!@#$...)' : 'Special character (!@#$...)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
    ];
  }, [form.password, language]);

  const isPasswordValid = passwordChecks.every((c) => c.valid);

  const canProceedStep2 = form.name.trim() !== '' && form.email.trim() !== '' && isPasswordValid;

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await authAPI.sendOTP({
        name: form.name,
        email: form.email,
        password: form.password,
        age: form.age ? parseInt(form.age) : undefined,
        language: language,
        currency: currency,
        personality: form.personality,
      });
      setOtpSent(true);
      setStep(5);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyOTP({
        email: form.email,
        code: otpCode,
      });
      setTokens(res.data.access_token, res.data.refresh_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const personas = [
    {
      id: 'rizky',
      emoji: '🔥',
      name: 'Rizky',
      desc: {
        en: 'Sharp analyst. Direct, data-driven, no sugarcoating.',
        id: 'Analis tajam. Langsung, berbasis data, tanpa basa-basi.',
        zh: '犀利分析师。直接、数据驱动、不加粉饰。',
      },
    },
    {
      id: 'dinda',
      emoji: '💜',
      name: 'Dinda',
      desc: {
        en: 'Supportive motivator. Warm, encouraging, celebrates wins.',
        id: 'Motivator supportive. Hangat, menyemangati, merayakan kemenangan.',
        zh: '暖心激励者。温暖、鼓励、庆祝每一次进步。',
      },
    },
  ];

  const totalSteps = 5;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950">
      {/* Background ambient glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-primary/[0.04] rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-lg font-bold shadow-lg shadow-brand-primary/25">
            F$
          </div>
          <h1 className="text-xl font-bold gradient-text">FinSassy AI</h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/[0.06]"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                initial={{ width: '0%' }}
                animate={{ width: s <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Step 1: Language & Currency */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
            <h2 className="text-2xl font-display font-bold mb-2">{t(dict, 'onboarding.step2Title')}</h2>
            <p className="text-slate-500 mb-8">{t(dict, 'onboarding.step2Desc')}</p>
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
          </motion.div>
        )}

        {/* Step 2: Account details + Password validation */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
            <h2 className="text-2xl font-display font-bold mb-2">{t(dict, 'auth.signupTitle')}</h2>
            <p className="text-slate-500 mb-8">{t(dict, 'auth.signupSubtitle')}</p>
            <div className="space-y-5">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'auth.name')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field w-full pl-11"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'auth.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field w-full pl-11"
                    placeholder={language === 'id' ? 'Buat password...' : 'Create password...'}
                    required
                  />
                </div>
                {/* Password requirements */}
                {form.password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="mt-3 bg-white/[0.03] backdrop-blur-sm rounded-xl p-3.5 border border-white/[0.06] space-y-2"
                  >
                    {passwordChecks.map((check, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2.5 text-xs"
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${check.valid ? 'bg-emerald-500/20' : 'bg-white/[0.06]'}`}>
                          {check.valid ? (
                            <Check size={10} className="text-emerald-400" />
                          ) : (
                            <X size={10} className="text-slate-500" />
                          )}
                        </div>
                        <span className={`transition-colors ${check.valid ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {check.label}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block font-medium">{t(dict, 'auth.age')}</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="input-field w-full"
                  min={13}
                  max={100}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Choose persona */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
            <h2 className="text-2xl font-display font-bold mb-2">{t(dict, 'onboarding.step4Title')}</h2>
            <p className="text-slate-500 mb-8">{t(dict, 'onboarding.step4Desc')}</p>
            <div className="space-y-4">
              {personas.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  onClick={() => setForm({ ...form, personality: p.id })}
                  className={`w-full flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 text-left
                    ${form.personality === p.id
                      ? 'border-brand-primary/50 bg-brand-primary/[0.08] shadow-lg shadow-brand-primary/5'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors ${form.personality === p.id ? 'bg-brand-primary/20' : 'bg-white/[0.04]'}`}>
                    {p.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{p.desc[language] || p.desc.en}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
            <h2 className="text-2xl font-display font-bold mb-2">{t(dict, 'onboarding.step5Title')}</h2>
            <p className="text-slate-500 mb-8">{t(dict, 'onboarding.step5Desc')}</p>
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] space-y-4">
              {[
                { label: t(dict, 'auth.name'), value: form.name },
                { label: t(dict, 'auth.email'), value: form.email },
                { label: t(dict, 'settings.language'), value: language.toUpperCase() },
                { label: t(dict, 'settings.currency'), value: currency },
                { label: t(dict, 'settings.personality'), value: form.personality },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex justify-between text-sm py-1 ${i < 4 ? 'border-b border-white/[0.04]' : ''}`}
                >
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium capitalize">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: OTP Verification */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-5"
              >
                <ShieldCheck size={40} className="text-brand-primary" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold mb-2">
                {language === 'id' ? 'Verifikasi Email' : language === 'zh' ? '邮箱验证' : 'Verify Your Email'}
              </h2>
              <p className="text-slate-400 text-sm">
                {language === 'id'
                  ? `Kami telah mengirim kode 6 digit ke`
                  : language === 'zh'
                  ? `我们已发送6位验证码至`
                  : `We've sent a 6-digit code to`}
              </p>
              <p className="text-brand-primary font-semibold mt-1">{form.email}</p>
            </div>
            <div className="space-y-5">
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field w-full text-center text-3xl tracking-[16px] font-mono py-4"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-slate-500 text-center">
                {language === 'id'
                  ? 'Kode berlaku selama 5 menit.'
                  : language === 'zh'
                  ? '验证码有效期5分钟。'
                  : 'Code valid for 5 minutes.'}
              </p>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleSendOTP}
                loading={loading}
              >
                {language === 'id' ? 'Kirim Ulang Kode' : language === 'zh' ? '重新发送' : 'Resend Code'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 && step < 5 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ChevronLeft size={18} />
              {t(dict, 'common.back')}
            </Button>
          ) : step === 5 ? (
            <Button variant="ghost" onClick={() => { setStep(4); setOtpSent(false); setError(''); }}>
              <ChevronLeft size={18} />
              {t(dict, 'common.back')}
            </Button>
          ) : (
            <Link href="/login" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
              {t(dict, 'auth.hasAccount')} {t(dict, 'auth.login')}
            </Link>
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && !canProceedStep2}
            >
              {t(dict, 'common.next')}
              <ChevronRight size={18} />
            </Button>
          ) : step === 4 ? (
            <Button variant="primary" onClick={handleSendOTP} loading={loading}>
              {language === 'id' ? 'Kirim Kode Verifikasi' : language === 'zh' ? '发送验证码' : 'Send Verification Code'}
              <ArrowRight size={18} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleVerifyOTP}
              loading={loading}
              disabled={otpCode.length !== 6}
            >
              {language === 'id' ? 'Verifikasi & Daftar' : language === 'zh' ? '验证并注册' : 'Verify & Sign Up'}
              <ArrowRight size={18} />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
