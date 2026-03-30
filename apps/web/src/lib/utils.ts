type CurrencyCode = 'USD' | 'IDR' | 'CNY';

const CURRENCY_CONFIG: Record<CurrencyCode, { locale: string; currency: string; decimals: number }> = {
  USD: { locale: 'en-US', currency: 'USD', decimals: 2 },
  IDR: { locale: 'id-ID', currency: 'IDR', decimals: 0 },
  CNY: { locale: 'zh-CN', currency: 'CNY', decimals: 2 },
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const config = CURRENCY_CONFIG[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function getMoodEmoji(mood: string): string {
  switch (mood) {
    case 'green': return '😊';
    case 'yellow': return '😐';
    case 'red': return '😰';
    default: return '🤔';
  }
}

export function getMoodLabel(mood: string, lang: string = 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    green: { en: 'Healthy', id: 'Sehat', zh: '健康' },
    yellow: { en: 'Caution', id: 'Hati-hati', zh: '注意' },
    red: { en: 'Alert', id: 'Waspada', zh: '警告' },
  };
  return labels[mood]?.[lang] || labels[mood]?.en || mood;
}
