export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', locale: 'en-US', decimals: 2, name: 'US Dollar' },
  IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID', decimals: 0, name: 'Indonesian Rupiah' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN', decimals: 2, name: 'Chinese Yuan' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const config = CURRENCIES[currencyCode];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].symbol;
}
