from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, QuizAttempt, Badge, UserBadge, Article, LearningStreak
from schemas import QuizSubmit
from utils.jwt_handler import get_current_user_id
from services.llm_service import generate_quiz, generate_article
from datetime import date, datetime, timedelta

router = APIRouter(prefix="/learning", tags=["Learning"])


STATIC_ARTICLES = [
    {
        "id": "art-1",
        "title": {"en": "The 50/30/20 Budget Rule Explained", "id": "Aturan Anggaran 50/30/20 Dijelaskan", "zh": "50/30/20预算法则详解"},
        "summary": {"en": "Learn how to split your income into needs, wants, and savings.", "id": "Pelajari cara membagi pendapatan Anda menjadi kebutuhan, keinginan, dan tabungan.", "zh": "了解如何将收入分配到需求、欲望和储蓄。"},
        "content": {"en": "The 50/30/20 rule suggests allocating 50% of after-tax income to needs (rent, food, utilities), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment. This simple framework helps create a balanced budget without tracking every cent.", "id": "Aturan 50/30/20 menyarankan mengalokasikan 50% pendapatan setelah pajak untuk kebutuhan (sewa, makanan, utilitas), 30% untuk keinginan (hiburan, makan di luar), dan 20% untuk tabungan dan pembayaran utang. Kerangka sederhana ini membantu membuat anggaran yang seimbang tanpa melacak setiap sen.", "zh": "50/30/20法则建议将税后收入的50%分配给需求（房租、食物、水电），30%给欲望（娱乐、外出就餐），20%用于储蓄和偿还债务。"},
        "category": "budgeting",
        "emoji": "💰",
        "read_time": 3,
    },
    {
        "id": "art-2",
        "title": {"en": "Compound Interest: The 8th Wonder of the World", "id": "Bunga Majemuk: Keajaiban Dunia ke-8", "zh": "复利：世界第八大奇迹"},
        "summary": {"en": "Discover how compound interest can grow your wealth over time.", "id": "Temukan bagaimana bunga majemuk dapat menumbuhkan kekayaan Anda seiring waktu.", "zh": "了解复利如何随时间增长您的财富。"},
        "content": {"en": "Compound interest is interest earned on both the principal and accumulated interest. If you invest $1,000 at 8% annual return, after 30 years you'd have $10,063 — over 10x your original investment! Start early, stay consistent, and let time work for you.", "id": "Bunga majemuk adalah bunga yang diperoleh dari pokok dan bunga yang telah terkumpul. Jika Anda menginvestasikan Rp10.000.000 dengan pengembalian tahunan 8%, setelah 30 tahun Anda akan memiliki lebih dari Rp100.000.000! Mulai lebih awal, tetap konsisten, dan biarkan waktu bekerja untuk Anda.", "zh": "复利是指对本金和累计利息都计算利息。如果您以8%的年回报率投资1000美元，30年后将变成10,063美元！尽早开始，保持一致，让时间为您工作。"},
        "category": "investing",
        "emoji": "📈",
        "read_time": 4,
    },
    {
        "id": "art-3",
        "title": {"en": "Emergency Fund: Your Financial Safety Net", "id": "Dana Darurat: Jaring Pengaman Keuangan Anda", "zh": "应急基金：你的财务安全网"},
        "summary": {"en": "Why you need 3-6 months of expenses saved for unexpected events.", "id": "Mengapa Anda perlu menabung 3-6 bulan biaya hidup untuk kejadian tak terduga.", "zh": "为什么你需要储蓄3-6个月的生活费用以应对突发事件。"},
        "content": {"en": "An emergency fund covers 3-6 months of living expenses for unexpected situations like medical bills, car repairs, or job loss. Keep it in a separate high-yield savings account for easy access. Start small — even saving 10% of each paycheck adds up quickly.", "id": "Dana darurat mencakup 3-6 bulan biaya hidup untuk situasi tak terduga seperti tagihan medis, perbaikan kendaraan, atau kehilangan pekerjaan. Simpan di rekening tabungan terpisah dengan bunga tinggi. Mulai kecil — bahkan menabung 10% dari setiap gaji akan cepat bertambah.", "zh": "应急基金涵盖3-6个月的生活费用，用于医疗账单、汽车维修或失业等意外情况。将其存放在高收益储蓄账户中。从小处开始——即使每次工资存10%也会很快积累起来。"},
        "category": "saving",
        "emoji": "🛡️",
        "read_time": 3,
    },
    {
        "id": "art-4",
        "title": {"en": "Understanding Inflation and Your Money", "id": "Memahami Inflasi dan Uang Anda", "zh": "了解通货膨胀与你的钱"},
        "summary": {"en": "How inflation silently erodes your purchasing power and what to do about it.", "id": "Bagaimana inflasi diam-diam mengikis daya beli Anda dan apa yang harus dilakukan.", "zh": "通货膨胀如何悄悄侵蚀你的购买力以及如何应对。"},
        "content": {"en": "Inflation means your money buys less over time. At 3% inflation, $100 today is worth only $74 in 10 years. To beat inflation, invest in assets that grow faster than inflation — stocks, real estate, or inflation-protected bonds. Keeping all your money in a regular savings account means you're actually losing purchasing power.", "id": "Inflasi berarti uang Anda membeli lebih sedikit seiring waktu. Dengan inflasi 3%, Rp1.000.000 hari ini hanya bernilai Rp740.000 dalam 10 tahun. Untuk mengalahkan inflasi, investasikan di aset yang tumbuh lebih cepat — saham, properti, atau obligasi.", "zh": "通货膨胀意味着你的钱随时间推移购买力下降。在3%的通胀率下，今天的100元10年后只值74元。要战胜通胀，投资于增长快于通胀的资产——股票、房地产或通胀保护债券。"},
        "category": "economics",
        "emoji": "📊",
        "read_time": 4,
    },
    {
        "id": "art-5",
        "title": {"en": "Good Debt vs Bad Debt: Know the Difference", "id": "Utang Baik vs Utang Buruk: Ketahui Perbedaannya", "zh": "好的债务与坏的债务：知道区别"},
        "summary": {"en": "Not all debt is created equal. Learn which debts help build wealth.", "id": "Tidak semua utang sama. Pelajari utang mana yang membantu membangun kekayaan.", "zh": "并非所有债务都一样。了解哪些债务有助于积累财富。"},
        "content": {"en": "Good debt is an investment that grows in value — like education loans (higher earning potential) or mortgages (property appreciation). Bad debt finances depreciating items or consumption — like credit card debt for shopping sprees or car loans at high interest rates. Rule of thumb: if it won't generate income or appreciate, avoid borrowing for it.", "id": "Utang baik adalah investasi yang nilainya bertumbuh — seperti pinjaman pendidikan atau KPR. Utang buruk membiayai barang yang menyusut — seperti utang kartu kredit untuk belanja atau pinjaman mobil dengan bunga tinggi. Aturan praktis: jika tidak menghasilkan pendapatan atau meningkat nilainya, hindari berutang untuk membelinya.", "zh": "好的债务是价值增长的投资——如教育贷款（更高收入潜力）或房贷（房产增值）。坏的债务为贬值或消费品融资——如信用卡购物债务或高利率汽车贷款。经验法则：如果不能产生收入或增值，就避免借钱购买。"},
        "category": "debt",
        "emoji": "⚖️",
        "read_time": 4,
    },
    {
        "id": "art-6",
        "title": {"en": "Side Hustles: Boost Your Income in 2024", "id": "Penghasilan Tambahan: Tingkatkan Pendapatan Anda di 2024", "zh": "副业：2024年增加你的收入"},
        "summary": {"en": "Practical ways to earn extra income alongside your main job.", "id": "Cara praktis untuk mendapatkan penghasilan tambahan di samping pekerjaan utama.", "zh": "在主要工作之外赚取额外收入的实用方法。"},
        "content": {"en": "Popular side hustles include freelancing (writing, design, coding), selling digital products, tutoring, content creation, and e-commerce. Start with skills you already have. Even 5-10 hours per week can generate an extra $500-$2,000/month. Reinvest your side hustle income into savings or investments for maximum impact.", "id": "Penghasilan tambahan populer termasuk freelancing (menulis, desain, coding), menjual produk digital, bimbingan belajar, pembuatan konten, dan e-commerce. Mulai dengan keahlian yang sudah Anda miliki. Bahkan 5-10 jam per minggu bisa menghasilkan tambahan Rp2-8 juta/bulan.", "zh": "热门副业包括自由职业（写作、设计、编程）、销售数字产品、辅导、内容创作和电子商务。从你已有的技能开始。每周即使只有5-10小时也能每月额外赚取500-2000美元。"},
        "category": "income",
        "emoji": "🚀",
        "read_time": 3,
    },
]


@router.get("/articles/featured")
async def get_featured_articles(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    lang = user.language if user else "en"

    return [
        {
            "id": a["id"],
            "title": a["title"].get(lang, a["title"]["en"]),
            "summary": a["summary"].get(lang, a["summary"]["en"]),
            "content": a["content"].get(lang, a["content"]["en"]),
            "category": a["category"],
            "emoji": a["emoji"],
            "read_time": a["read_time"],
        }
        for a in STATIC_ARTICLES
    ]


@router.get("/quiz/generate")
async def generate_quiz_endpoint(
    trigger_category: str = "food_drink",
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    quiz = await generate_quiz(
        trigger_category=trigger_category,
        language=user.language,
        currency=user.currency,
    )

    # Store quiz attempt (unanswered)
    attempt = QuizAttempt(
        user_id=user_id,
        trigger_category=trigger_category,
        questions_json=quiz,
        language=user.language,
        total=len(quiz.get("questions", [])),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "id": str(attempt.id),
        "title": quiz.get("title", "Financial Quiz"),
        "questions": quiz.get("questions", []),
        "badge_reward": quiz.get("badge_reward"),
        "trigger_category": trigger_category,
    }


@router.post("/quiz/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: str,
    req: QuizSubmit,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.id == quiz_id,
        QuizAttempt.user_id == user_id,
    ).first()
    if not attempt:
        raise HTTPException(404, "Quiz not found")

    questions = attempt.questions_json.get("questions", [])
    score = sum(
        1 for i, ans in enumerate(req.answers)
        if i < len(questions) and questions[i].get("correct") == ans
    )

    attempt.answers_json = {"answers": req.answers}
    attempt.score = score
    attempt.completed_at = datetime.utcnow()

    # Update learning streak
    streak = db.query(LearningStreak).filter(
        LearningStreak.user_id == user_id
    ).first()
    if not streak:
        streak = LearningStreak(user_id=user_id)
        db.add(streak)

    today = date.today()
    if streak.last_activity == today - timedelta(days=1):
        streak.current_streak += 1
    elif streak.last_activity != today:
        streak.current_streak = 1
    streak.last_activity = today
    streak.longest_streak = max(streak.longest_streak, streak.current_streak)

    # Check badge eligibility
    badge_code = attempt.questions_json.get("badge_reward")
    if badge_code and score == attempt.total:
        badge = db.query(Badge).filter(Badge.code == badge_code).first()
        if badge:
            existing = db.query(UserBadge).filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == badge.id,
            ).first()
            if not existing:
                db.add(UserBadge(user_id=user_id, badge_id=badge.id))

    db.commit()

    return {
        "score": score,
        "total": attempt.total,
        "percentage": round(score / attempt.total * 100) if attempt.total > 0 else 0,
        "badge_earned": badge_code if score == attempt.total else None,
        "streak": streak.current_streak,
    }


@router.get("/articles/generate")
async def generate_article_endpoint(
    topic: str = "opportunity_cost",
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    result = await generate_article(
        topic=topic,
        language=user.language,
        currency=user.currency,
    )

    article = Article(
        user_id=user_id,
        topic=topic,
        content=result.get("content", ""),
        language=user.language,
        trigger_category=topic,
    )
    db.add(article)
    db.commit()
    db.refresh(article)

    return {
        "id": str(article.id),
        "topic": topic,
        "title": result.get("title", topic),
        "content": result.get("content", ""),
        "key_takeaway": result.get("key_takeaway", ""),
        "language": user.language,
    }


@router.get("/badges")
async def list_badges(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    lang = user.language
    badges = db.query(Badge).all()
    earned_ids = {
        ub.badge_id
        for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    }

    return [
        {
            "id": str(b.id),
            "code": b.code,
            "name": getattr(b, f"name_{lang}", b.name_en),
            "description": getattr(b, f"description_{lang}", b.description_en),
            "icon_url": b.icon_url,
            "earned": b.id in earned_ids,
        }
        for b in badges
    ]


@router.get("/streaks")
async def get_streak(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    streak = db.query(LearningStreak).filter(
        LearningStreak.user_id == user_id
    ).first()
    if not streak:
        return {"current_streak": 0, "longest_streak": 0, "last_activity": None}
    return {
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "last_activity": streak.last_activity,
    }
