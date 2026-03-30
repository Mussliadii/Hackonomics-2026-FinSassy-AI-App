from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import PreferencesUpdate, UserResponse
from utils.jwt_handler import get_current_user_id
from utils.security import validate_language, validate_currency, validate_tone, sanitize_input

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.put("/profile")
async def update_profile(
    name: str = None,
    age: int = None,
    savings_target: int = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if name:
        user.name = sanitize_input(name, 100)
    if age is not None:
        user.age = age
    if savings_target is not None:
        user.savings_target = savings_target

    db.commit()
    return {"message": "Profile updated"}


@router.put("/preferences")
async def update_preferences(
    req: PreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if req.language:
        if not validate_language(req.language):
            raise HTTPException(400, "Invalid language")
        user.language = req.language
    if req.currency:
        if not validate_currency(req.currency):
            raise HTTPException(400, "Invalid currency")
        user.currency = req.currency
    if req.tone_preference:
        if not validate_tone(req.tone_preference):
            raise HTTPException(400, "Invalid tone")
        user.tone_preference = req.tone_preference
    if req.personality:
        user.personality = req.personality
    if req.notify_morning is not None:
        user.notify_morning = req.notify_morning
    if req.savings_target is not None:
        user.savings_target = req.savings_target

    db.commit()
    return {"message": "Preferences updated"}


@router.delete("/data")
async def delete_user_data(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # Delete all related data
    from models import Transaction, RoastHistory, QuizAttempt, UserBadge, Article, LearningStreak
    db.query(Transaction).filter(Transaction.user_id == user_id).delete()
    db.query(RoastHistory).filter(RoastHistory.user_id == user_id).delete()
    db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).delete()
    db.query(UserBadge).filter(UserBadge.user_id == user_id).delete()
    db.query(Article).filter(Article.user_id == user_id).delete()
    db.query(LearningStreak).filter(LearningStreak.user_id == user_id).delete()
    db.delete(user)
    db.commit()

    return {"message": "All user data deleted"}
