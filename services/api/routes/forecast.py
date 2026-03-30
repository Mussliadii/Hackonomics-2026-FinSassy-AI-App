from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Forecast, Transaction, User
from utils.jwt_handler import get_current_user_id

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get("/bills")
async def forecast_bills(
    months_ahead: int = 1,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    forecasts = (
        db.query(Forecast)
        .filter(Forecast.user_id == user_id)
        .order_by(Forecast.predicted_date.asc())
        .limit(20)
        .all()
    )

    return [
        {
            "id": str(f.id),
            "bill_name": f.bill_name,
            "predicted_date": f.predicted_date,
            "predicted_amount": f.predicted_amount,
            "currency": f.currency,
            "confidence": f.confidence,
        }
        for f in forecasts
    ]


@router.get("/cashflow")
async def forecast_cashflow(
    month: str = None,  # YYYY-MM
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Simplified cash flow data - in production, use ML forecast
    today = date.today()
    start = today.replace(day=1)
    weeks = []

    for week_num in range(5):
        week_start = start + timedelta(weeks=week_num)
        week_end = week_start + timedelta(days=6)

        income = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "income",
                Transaction.transaction_date >= week_start,
                Transaction.transaction_date <= week_end,
            )
            .scalar() or 0
        )

        expenses = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                Transaction.transaction_date >= week_start,
                Transaction.transaction_date <= week_end,
            )
            .scalar() or 0
        )

        weeks.append({
            "week": week_num + 1,
            "start_date": str(week_start),
            "end_date": str(week_end),
            "income": income,
            "expenses": expenses,
            "net": income - expenses,
        })

    user = db.query(User).filter(User.id == user_id).first()

    return {
        "currency": user.currency if user else "USD",
        "weeks": weeks,
    }
