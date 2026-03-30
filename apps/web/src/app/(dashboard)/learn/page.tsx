'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Trophy,
  Flame as FireIcon,
  BookOpen,
  CheckCircle,
  XCircle,
  Award,
  ChevronLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { learningAPI } from '@/lib/api';
import { getDictionary, t } from '@/i18n';

type Tab = 'quiz' | 'articles' | 'badges';

interface QuizQuestion {
  question: string;
  options: Record<string, string>;
  correct: string;
  explanation: string;
}

export default function LearnPage() {
  const { language } = useAppStore();
  const dict = getDictionary(language);

  const [tab, setTab] = useState<Tab>('quiz');
  const [quizData, setQuizData] = useState<{ id: string; title: string; questions: QuizQuestion[] } | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState<Record<string, unknown>[]>([]);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [article, setArticle] = useState<Record<string, string> | null>(null);
  const [staticArticles, setStaticArticles] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    learningAPI.streaks()
      .then((res) => setStreak(res.data))
      .catch(() => {});
    learningAPI.badges()
      .then((res) => setBadges(res.data))
      .catch(() => {});
    learningAPI.staticArticles()
      .then((res) => setStaticArticles(res.data))
      .catch(() => {});
  }, []);

  const generateQuiz = async () => {
    setLoading(true);
    setQuizResult(null);
    try {
      const res = await learningAPI.generateQuiz('food_drink');
      setQuizData(res.data);
      setAnswers(new Array(res.data.questions.length).fill(''));
    } catch {
      setQuizData({
        id: 'demo',
        title: 'Financial Literacy Quiz',
        questions: [
          {
            question: 'What is the 50/30/20 budgeting rule?',
            options: {
              A: '50% needs, 30% wants, 20% savings',
              B: '50% savings, 30% needs, 20% wants',
              C: '50% wants, 30% savings, 20% needs',
              D: '50% investments, 30% needs, 20% wants',
            },
            correct: 'A',
            explanation: '50% of income for needs, 30% for wants, 20% for savings.',
          },
          {
            question: 'What is compound interest?',
            options: {
              A: 'Interest on the initial principal only',
              B: 'Interest on initial principal and accumulated interest',
              C: 'A fixed interest rate',
              D: 'Interest paid to the bank',
            },
            correct: 'B',
            explanation: 'Compound interest is interest earned on both the principal and previously earned interest.',
          },
          {
            question: 'What is an emergency fund?',
            options: {
              A: 'Money for vacations',
              B: 'Investment portfolio',
              C: '3-6 months of living expenses saved for unexpected events',
              D: 'Money for shopping',
            },
            correct: 'C',
            explanation: 'An emergency fund typically covers 3-6 months of expenses for unexpected situations.',
          },
        ],
      });
      setAnswers(['', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!quizData) return;
    setLoading(true);
    try {
      const res = await learningAPI.submitQuiz(quizData.id, answers);
      setQuizResult(res.data);
    } catch {
      // Fallback scoring
      const score = quizData.questions.reduce(
        (acc, q, i) => acc + (q.correct === answers[i] ? 1 : 0),
        0
      );
      setQuizResult({ score, total: quizData.questions.length, percentage: Math.round(score / quizData.questions.length * 100) });
    } finally {
      setLoading(false);
    }
  };

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await learningAPI.generateArticle('opportunity_cost');
      setArticle(res.data);
    } catch {
      setArticle({
        title: 'Understanding Opportunity Cost',
        content: 'Every financial decision has an opportunity cost - the value of the next best alternative you give up...',
        key_takeaway: 'Before spending, ask yourself: What else could this money do for me?',
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'quiz' as Tab, label: t(dict, 'learn.quiz'), icon: GraduationCap },
    { key: 'articles' as Tab, label: t(dict, 'learn.articles'), icon: BookOpen },
    { key: 'badges' as Tab, label: t(dict, 'learn.badges'), icon: Trophy },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{t(dict, 'learn.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t(dict, 'learn.subtitle')}</p>
        </div>
        {/* Streak */}
        <div className="flex items-center gap-3 bg-amber-500/[0.08] border border-amber-500/15 px-4 py-2.5 rounded-xl">
          <FireIcon size={20} className="text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-400">{streak.current_streak} {t(dict, 'learn.days')}</p>
            <p className="text-[10px] text-slate-500">{t(dict, 'learn.currentStreak')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${tab === key ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-slate-500 hover:text-white hover:bg-white/[0.06]'}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Quiz Tab */}
      {tab === 'quiz' && (
        <div className="space-y-4">
          {!quizData ? (
            <Card className="text-center py-12">
              <GraduationCap size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400 mb-6">{t(dict, 'learn.subtitle')}</p>
              <Button variant="primary" onClick={generateQuiz} loading={loading}>
                {t(dict, 'learn.startQuiz')}
              </Button>
            </Card>
          ) : (
            <>
              <Card>
                <h2 className="text-lg font-semibold mb-4">{quizData.title}</h2>
                <div className="space-y-6">
                  {quizData.questions.map((q, qi) => (
                    <div key={qi}>
                      <p className="font-medium mb-3">{qi + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(q.options).map(([key, val]) => {
                          const isSelected = answers[qi] === key;
                          const isCorrect = quizResult && q.correct === key;
                          const isWrong = quizResult && isSelected && q.correct !== key;

                          return (
                            <button
                              key={key}
                              onClick={() => {
                                if (!quizResult) {
                                  const newAnswers = [...answers];
                                  newAnswers[qi] = key;
                                  setAnswers(newAnswers);
                                }
                              }}
                              disabled={!!quizResult}
                              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all duration-200
                                ${isCorrect ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : ''}
                                ${isWrong ? 'border-red-500/50 bg-red-500/10 text-red-400' : ''}
                                ${!quizResult && isSelected ? 'border-brand-primary/50 bg-brand-primary/10 text-white' : ''}
                                ${!quizResult && !isSelected ? 'border-white/[0.06] hover:border-white/[0.15] text-slate-300' : ''}
                              `}
                            >
                              <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0">
                                {key}
                              </span>
                              {val}
                              {isCorrect && <CheckCircle size={16} className="ml-auto text-emerald-400" />}
                              {isWrong && <XCircle size={16} className="ml-auto text-red-400" />}
                            </button>
                          );
                        })}
                      </div>
                      {quizResult && (
                        <p className="text-xs text-slate-400 mt-2 italic">{q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>

                {!quizResult ? (
                  <Button
                    variant="primary"
                    className="w-full mt-6"
                    onClick={submitQuiz}
                    loading={loading}
                    disabled={answers.some((a) => !a)}
                  >
                    {t(dict, 'learn.submitQuiz')}
                  </Button>
                ) : (
                  <div className="mt-6 text-center">
                    <p className="text-2xl font-bold mb-2">
                      {t(dict, 'learn.score', {
                        score: quizResult.score as number,
                        total: quizResult.total as number,
                      })}
                    </p>
                    <p className="text-slate-400">
                      {(quizResult.percentage as number) === 100
                        ? t(dict, 'learn.perfect')
                        : (quizResult.percentage as number) >= 50
                        ? t(dict, 'learn.goodJob')
                        : t(dict, 'learn.tryAgain')}
                    </p>
                    <Button variant="secondary" className="mt-4" onClick={() => { setQuizData(null); setQuizResult(null); }}>
                      {t(dict, 'learn.startQuiz')}
                    </Button>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      )}

      {/* Articles Tab */}
      {tab === 'articles' && (
        <div className="space-y-4">
          {/* Static articles grid */}
          {staticArticles.length > 0 && !article && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staticArticles.map((a, i) => (
                <motion.div
                  key={a.id as string}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:border-brand-primary/50 transition-all group"
                    onClick={() => setArticle({ title: a.title as string, content: a.content as string, key_takeaway: a.summary as string })}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{a.emoji as string}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-brand-primary transition-colors">{a.title as string}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{a.summary as string}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] bg-white/[0.04] px-2 py-0.5 rounded-full text-slate-400 capitalize border border-white/[0.06]">{a.category as string}</span>
                          <span className="text-[10px] text-slate-500">{a.read_time as number} min read</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Single article view */}
          {article && (
            <Card>
              <Button variant="ghost" size="sm" onClick={() => setArticle(null)} className="mb-4">
                <ChevronLeft size={16} /> {t(dict, 'common.back')}
              </Button>
              <h2 className="text-xl font-bold mb-4">{article.title}</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{article.content}</p>
              {article.key_takeaway && (
                <div className="mt-6 p-4 bg-brand-primary/[0.08] border border-brand-primary/15 rounded-xl">
                  <p className="text-sm text-brand-primary font-semibold">Key Takeaway: {article.key_takeaway}</p>
                </div>
              )}
            </Card>
          )}

          {/* Generate AI article */}
          {!article && (
            <Card className="text-center py-8">
              <BookOpen size={32} className="mx-auto text-slate-500 mb-3" />
              <p className="text-sm text-slate-400 mb-4">{language === 'id' ? 'Atau buat artikel dengan AI' : language === 'zh' ? '或用AI生成文章' : 'Or generate an AI article'}</p>
              <Button variant="secondary" onClick={loadArticle} loading={loading}>
                {t(dict, 'learn.articles')}
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Badges Tab */}
      {tab === 'badges' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.length > 0 ? badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`text-center ${(badge.earned as boolean) ? '' : 'opacity-40'}`}>
                <div className="text-3xl mb-2">{(badge.icon_url as string) || '🏅'}</div>
                <p className="font-semibold text-sm">{badge.name as string}</p>
                <p className="text-[10px] text-slate-400 mt-1">{badge.description as string}</p>
                {(badge.earned as boolean) && (
                  <Award size={14} className="text-amber-400 mx-auto mt-2" />
                )}
              </Card>
            </motion.div>
          )) : (
            <Card className="col-span-full text-center py-12">
              <Trophy size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">{t(dict, 'common.noData')}</p>
            </Card>
          )}
        </div>
      )}
    </motion.div>
  );
}
