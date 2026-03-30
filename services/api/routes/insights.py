from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from database import get_db
from models import Transaction, User, LearningStreak
from utils.jwt_handler import get_current_user_id

router = APIRouter(prefix="/insights", tags=["Insights"])


def _compute_mood(budget_used_pct: float) -> str:
    if budget_used_pct <= 75:
        return "green"
    elif budget_used_pct <= 100:
        return "yellow"
    return "red"


@router.get("/financial-health")
async def financial_health(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"score": 50, "mood": "yellow", "budget_used_percentage": 0, "savings_progress_percentage": 0, "streak_days": 0}

    # Calculate total expenses this month
    first_of_month = date.today().replace(day=1)
    total_expenses = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date >= first_of_month,
        )
        .scalar() or 0
    )

    total_income = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.transaction_date >= first_of_month,
        )
        .scalar() or 0
    )

    budget_used_pct = (total_expenses / total_income * 100) if total_income > 0 else 0
    savings = total_income - total_expenses
    savings_pct = (savings / user.savings_target * 100) if user.savings_target > 0 else 0

    streak = db.query(LearningStreak).filter(LearningStreak.user_id == user_id).first()
    streak_days = streak.current_streak if streak else 0

    mood = _compute_mood(budget_used_pct)
    score = max(0, min(100, int(100 - budget_used_pct + savings_pct / 2)))

    return {
        "score": score,
        "mood": mood,
        "budget_used_percentage": round(budget_used_pct, 1),
        "savings_progress_percentage": round(min(savings_pct, 100), 1),
        "streak_days": streak_days,
        "total_expenses": total_expenses,
        "total_income": total_income,
        "net_savings": savings,
        "currency": user.currency,
    }


@router.get("/daily-digest")
async def daily_digest(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"insight": "Welcome to FinSassy AI!", "reflection_question": "What are your financial goals?"}

    today = date.today()
    today_expenses = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date == today,
        )
        .scalar() or 0
    )

    # Simple insight generation (LLM integration for production)
    insights = {
        "en": {
            "insight": f"You've spent {today_expenses} today. Stay mindful of your goals!",
            "question": "What's one purchase you can skip today?",
        },
        "id": {
            "insight": f"Hari ini kamu sudah belanja {today_expenses}. Tetap fokus pada targetmu!",
            "question": "Satu pembelian apa yang bisa kamu skip hari ini?",
        },
        "zh": {
            "insight": f"今天你已经花了{today_expenses}。保持对目标的关注！",
            "question": "今天有什么消费是你可以省下的？",
        },
    }

    lang_data = insights.get(user.language, insights["en"])

    health = _compute_mood(50)  # Simplified

    return {
        "insight": lang_data["insight"],
        "reflection_question": lang_data["question"],
        "total_spent_today": today_expenses,
        "mood": health,
        "currency": user.currency,
    }
