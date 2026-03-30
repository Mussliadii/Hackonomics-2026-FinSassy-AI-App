'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { accessToken } = useAppStore();

  useEffect(() => {
    if (accessToken) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [accessToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-2xl gradient-text font-bold">FinSassy AI</div>
    </div>
  );
}
