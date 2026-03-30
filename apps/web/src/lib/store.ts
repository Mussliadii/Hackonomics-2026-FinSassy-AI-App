import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mood = 'green' | 'yellow' | 'red';
type Language = 'en' | 'id' | 'zh';
type Currency = 'USD' | 'IDR' | 'CNY';

interface AppState {
  // Auth
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;

  // User preferences
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (cur: Currency) => void;

  // Mood
  mood: Mood;
  financialScore: number;
  setMood: (mood: Mood) => void;
  setFinancialScore: (score: number) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      accessToken: null,
      refreshToken: null,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null }),

      // Preferences
      language: 'en',
      currency: 'USD',
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),

      // Mood
      mood: 'green',
      financialScore: 75,
      setMood: (mood) => set({ mood }),
      setFinancialScore: (score) => set({ financialScore: score }),

      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'finsassy-store',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        language: state.language,
        currency: state.currency,
      }),
    }
  )
);
