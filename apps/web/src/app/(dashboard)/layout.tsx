'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Sidebar from '@/components/layout/Sidebar';
import { QuickLanguageSwitcher } from '@/components/ui/LocaleSwitcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, mood, sidebarOpen } = useAppStore();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <div className="min-h-screen bg-slate-950" data-mood={mood}>
      <Sidebar />
      <main
        className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen ${
          sidebarOpen ? 'ml-[260px]' : 'ml-[72px]'
        } max-md:ml-0`}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3 flex items-center justify-end gap-3">
          <QuickLanguageSwitcher />
        </div>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
