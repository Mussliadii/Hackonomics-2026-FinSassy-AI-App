from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from models import Transaction, User, RoastHistory
from schemas import RoastRequest, RoastResponse
from utils.jwt_handler import get_current_user_id
from utils.security import mask_pii, validate_tone
from services.llm_service import generate_roast

router = APIRouter(prefix="/roast", tags=["Roast"])


@router.post("/generate")
async def generate_roast_endpoint(
    req: RoastRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not validate_tone(req.tone):
        raise HTTPException(400, "Tone must be: mild, spicy, or extra")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # Get spending data for the period
    start_date = datetime.utcnow() - timedelta(days=req.period_days)
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.created_at >= start_date,
        )
        .all()
    )

    if not transactions:
        raise HTTPException(400, "No transactions found for this period. Add some spending data first!")

    # Build spending summary
    summary = {}
    for t in transactions:
        cat = t.category_id or "uncategorized"
        if cat not in summary:
            summary[cat] = {"total": 0, "count": 0, "items": []}
        summary[cat]["total"] += t.amount
        summary[cat]["count"] += 1
        summary[cat]["items"].append(mask_pii(t.raw_text or ""))

    total_spent = sum(v["total"] for v in summary.values())

    spending_data = {
        "period_days": req.period_days,
        "total_spent": total_spent,
        "currency": user.currency,
        "categories": summary,
        "savings_target": user.savings_target,
    }

    # Generate roast via LLM
    result = await generate_roast(
        spending_data=spending_data,
        tone=req.tone,
        language=user.language,
        currency=user.currency,
        user_name=user.name,
        savings_target=user.savings_target,
        personality=user.personality or "rizky",
    )

    # Save to history
    roast_record = RoastHistory(
        user_id=user_id,
        roast_text=result["roast_text"],
        tone=req.tone,
        language=user.language,
        data_summary=spending_data,
    )
    db.add(roast_record)
    db.commit()
    db.refresh(roast_record)

    return {
        "id": str(roast_record.id),
        "roast_text": result["roast_text"],
        "micro_tip": result["micro_tip"],
        "tone": req.tone,
        "language": user.language,
        "data_summary": spending_data,
        "created_at": roast_record.created_at,
    }


@router.get("/history")
async def roast_history(
    page: int = 1,
    per_page: int = 10,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    roasts = (
        db.query(RoastHistory)
        .filter(RoastHistory.user_id == user_id)
        .order_by(RoastHistory.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "roast_text": r.roast_text,
            "tone": r.tone,
            "language": r.language,
            "was_shared": r.was_shared,
            "created_at": r.created_at,
        }
        for r in roasts
    ]


@router.put("/{roast_id}/share")
async def record_share(
    roast_id: str,
    platform: str = "whatsapp",
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    roast = db.query(RoastHistory).filter(
        RoastHistory.id == roast_id,
        RoastHistory.user_id == user_id,
    ).first()
    if not roast:
        raise HTTPException(404, "Roast not found")

    roast.was_shared = True
    roast.share_platform = platform
    db.commit()
    return {"message": "Share recorded"}
