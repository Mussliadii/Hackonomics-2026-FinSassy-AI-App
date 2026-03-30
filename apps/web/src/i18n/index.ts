import en from './en.json';
import id from './id.json';
import zh from './zh.json';

export type Language = 'en' | 'id' | 'zh';

const dictionaries: Record<Language, typeof en> = { en, id, zh };

export function getDictionary(lang: Language) {
  return dictionaries[lang] || dictionaries.en;
}

export function t(
  dict: typeof en,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: unknown = dict;
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  if (typeof value !== 'string') return key;

  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, String(v)),
      value
    );
  }
  return value;
}
