export const CATEGORIES = [
  { id: 'food_drink', icon: '🍔', nameEn: 'Food & Drink', nameId: 'Makanan & Minuman', nameZh: '餐饮' },
  { id: 'transportation', icon: '🚗', nameEn: 'Transportation', nameId: 'Transportasi', nameZh: '交通' },
  { id: 'shopping', icon: '🛍️', nameEn: 'Shopping', nameId: 'Belanja', nameZh: '购物' },
  { id: 'entertainment', icon: '🎮', nameEn: 'Entertainment', nameId: 'Hiburan', nameZh: '娱乐' },
  { id: 'bills_utilities', icon: '💡', nameEn: 'Bills & Utilities', nameId: 'Tagihan & Utilitas', nameZh: '账单' },
  { id: 'health', icon: '🏥', nameEn: 'Health', nameId: 'Kesehatan', nameZh: '医疗' },
  { id: 'education', icon: '📚', nameEn: 'Education', nameId: 'Pendidikan', nameZh: '教育' },
  { id: 'investment', icon: '📈', nameEn: 'Investment', nameId: 'Investasi', nameZh: '投资' },
  { id: 'income', icon: '💰', nameEn: 'Income', nameId: 'Pendapatan', nameZh: '收入' },
  { id: 'transfer', icon: '🔄', nameEn: 'Transfer', nameId: 'Transfer', nameZh: '转账' },
  { id: 'subscription', icon: '📱', nameEn: 'Subscription', nameId: 'Langganan', nameZh: '订阅' },
  { id: 'groceries', icon: '🛒', nameEn: 'Groceries', nameId: 'Belanja Harian', nameZh: '日用品' },
  { id: 'other', icon: '📌', nameEn: 'Other', nameId: 'Lainnya', nameZh: '其他' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
