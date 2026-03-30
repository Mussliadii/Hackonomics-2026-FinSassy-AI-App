"""Seed script to populate the database with demo data and default categories."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'services', 'api'))

from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Base, Category, Badge, User
from utils.jwt_handler import hash_password


def seed_categories(db: Session):
    categories = [
        {"name_en": "Food & Drink", "name_id": "Makanan & Minuman", "name_zh": "餐饮", "icon": "🍔", "is_default": True},
        {"name_en": "Transportation", "name_id": "Transportasi", "name_zh": "交通", "icon": "🚗", "is_default": True},
        {"name_en": "Shopping", "name_id": "Belanja", "name_zh": "购物", "icon": "🛍️", "is_default": True},
        {"name_en": "Entertainment", "name_id": "Hiburan", "name_zh": "娱乐", "icon": "🎬", "is_default": True},
        {"name_en": "Bills & Utilities", "name_id": "Tagihan & Utilitas", "name_zh": "账单", "icon": "💡", "is_default": True},
        {"name_en": "Health", "name_id": "Kesehatan", "name_zh": "健康", "icon": "🏥", "is_default": True},
        {"name_en": "Education", "name_id": "Pendidikan", "name_zh": "教育", "icon": "📚", "is_default": True},
        {"name_en": "Investment", "name_id": "Investasi", "name_zh": "投资", "icon": "📈", "is_default": True},
        {"name_en": "Income", "name_id": "Pemasukan", "name_zh": "收入", "icon": "💰", "is_default": True},
        {"name_en": "Transfer", "name_id": "Transfer", "name_zh": "转账", "icon": "🔄", "is_default": True},
        {"name_en": "Subscription", "name_id": "Langganan", "name_zh": "订阅", "icon": "📱", "is_default": True},
        {"name_en": "Groceries", "name_id": "Belanja Harian", "name_zh": "日用品", "icon": "🛒", "is_default": True},
        {"name_en": "Other", "name_id": "Lainnya", "name_zh": "其他", "icon": "📌", "is_default": True},
    ]

    existing = db.query(Category).count()
    if existing == 0:
        for cat in categories:
            db.add(Category(**cat))
        db.commit()
        print(f"✅ Seeded {len(categories)} categories")
    else:
        print(f"⏭️ Categories already exist ({existing})")


def seed_badges(db: Session):
    badges = [
        {"code": "first_roast", "name_en": "First Roast", "name_id": "Roast Pertama", "name_zh": "首次吐槽",
         "description_en": "Got your first spending roast", "description_id": "Dapat roast pertama", "description_zh": "获得第一次消费吐槽", "icon_url": "🔥"},
        {"code": "quiz_master", "name_en": "Quiz Master", "name_id": "Master Kuis", "name_zh": "测验大师",
         "description_en": "Score 100% on any quiz", "description_id": "Skor 100% di kuis manapun", "description_zh": "任何测验得满分", "icon_url": "🧠"},
        {"code": "streak_7", "name_en": "Week Warrior", "name_id": "Pejuang Mingguan", "name_zh": "周挑战者",
         "description_en": "7-day learning streak", "description_id": "Streak belajar 7 hari", "description_zh": "连续学习7天", "icon_url": "⚡"},
        {"code": "streak_30", "name_en": "Monthly Maven", "name_id": "Bintang Bulanan", "name_zh": "月度之星",
         "description_en": "30-day learning streak", "description_id": "Streak belajar 30 hari", "description_zh": "连续学习30天", "icon_url": "🌟"},
        {"code": "saver_pro", "name_en": "Saver Pro", "name_id": "Penabung Pro", "name_zh": "储蓄达人",
         "description_en": "Met savings target for a month", "description_id": "Capai target tabungan sebulan", "description_zh": "达成一个月储蓄目标", "icon_url": "💰"},
        {"code": "budget_boss", "name_en": "Budget Boss", "name_id": "Bos Budget", "name_zh": "预算达人",
         "description_en": "Stay under budget for a full month", "description_id": "Tetap di bawah budget sebulan penuh", "description_zh": "一整个月不超预算", "icon_url": "👑"},
        {"code": "smart_food_drink", "name_en": "Food Smart", "name_id": "Pintar Makan", "name_zh": "饮食达人",
         "description_en": "Completed food & drink quiz perfectly", "description_id": "Selesaikan kuis makanan dengan sempurna", "description_zh": "完美完成餐饮测验", "icon_url": "🍽️"},
        {"code": "first_upload", "name_en": "Data Driven", "name_id": "Berbasis Data", "name_zh": "数据驱动",
         "description_en": "Uploaded your first bank statement", "description_id": "Upload laporan bank pertama", "description_zh": "上传第一份银行对账单", "icon_url": "📊"},
    ]

    existing = db.query(Badge).count()
    if existing == 0:
        for badge in badges:
            db.add(Badge(**badge))
        db.commit()
        print(f"✅ Seeded {len(badges)} badges")
    else:
        print(f"⏭️ Badges already exist ({existing})")


def seed_demo_user(db: Session):
    existing = db.query(User).filter(User.email == "demo@finsassy.ai").first()
    if not existing:
        user = User(
            email="demo@finsassy.ai",
            password_hash=hash_password("demo1234"),
            name="Demo User",
            age=25,
            language="en",
            currency="USD",
            personality="rizky",
            savings_target=1000,
        )
        db.add(user)
        db.commit()
        print("✅ Seeded demo user (demo@finsassy.ai / demo1234)")
    else:
        print("⏭️ Demo user already exists")


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_categories(db)
        seed_badges(db)
        seed_demo_user(db)
        print("\n🎉 Seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
