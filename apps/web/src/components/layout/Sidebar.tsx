'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Flame,
  GraduationCap,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getDictionary, t } from '@/i18n';

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'transactions', href: '/transactions', icon: ArrowLeftRight },
  { key: 'roastMe', href: '/roast', icon: Flame },
  { key: 'learn', href: '/learn', icon: GraduationCap },
  { key: 'forecast', href: '/forecast', icon: TrendingUp },
  { key: 'settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { language, mood, sidebarOpen, toggleSidebar, clearTokens } = useAppStore();
  const dict = getDictionary(language);

  const moodColors = {
    green: 'from-emerald-500 to-teal-600',
    yellow: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
  };

  const moodGlow = {
    green: 'shadow-emerald-500/20',
    yellow: 'shadow-amber-500/20',
    red: 'shadow-red-500/20',
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-brand-card/80 backdrop-blur-lg p-2.5 rounded-xl border border-white/[0.08] shadow-xl"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed left-0 top-0 h-full z-40 bg-slate-950/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${moodColors[mood]} flex items-center justify-center text-lg font-bold shadow-lg ${moodGlow[mood]} shrink-0`}>
            F$
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-bold gradient-text">FinSassy AI</h1>
                <p className="text-[10px] text-slate-500">{t(dict, 'common.tagline')}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Collapse button (desktop) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex ml-auto p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? `bg-gradient-to-r ${moodColors[mood]} text-white shadow-lg ${moodGlow[mood]}`
                    : 'text-slate-500 hover:text-white hover:bg-white/[0.06]'
                  }`}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'group-hover:text-white transition-colors'}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {t(dict, `nav.${item.key}`)}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/[0.06]">
                    {t(dict, `nav.${item.key}`)}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={() => {
              clearTokens();
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] w-full transition-all duration-200"
          >
            <LogOut size={20} />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  {t(dict, 'auth.logout')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
