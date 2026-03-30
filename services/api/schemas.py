from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


# ─── Auth ───
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    age: Optional[int] = None
    language: str = "en"
    currency: str = "USD"
    personality: str = "casual"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    code: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    age: Optional[int]
    personality: str
    tone_preference: str
    language: str
    currency: str
    savings_target: int
    notify_morning: bool

    class Config:
        from_attributes = True


# ─── Transactions ───
class TransactionCreate(BaseModel):
    raw_text: str
    amount: float
    type: str  # income | expense
    transaction_date: date


class TransactionResponse(BaseModel):
    id: UUID
    raw_text: Optional[str]
    amount: int
    currency: str
    type: str
    category_id: Optional[str]
    ml_confidence: float
    is_user_corrected: bool
    is_anomaly: bool
    transaction_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryCorrection(BaseModel):
    corrected_category_id: str


class SpendingSummary(BaseModel):
    category: str
    total_amount: int
    count: int
    percentage: float


# ─── Roast ───
class RoastRequest(BaseModel):
    period_days: int = 7
    tone: str = "spicy"  # mild | spicy | extra


class RoastResponse(BaseModel):
    id: UUID
    roast_text: str
    tone: str
    language: str
    data_summary: dict
    micro_tip: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Quiz ───
class QuizQuestion(BaseModel):
    q: str
    options: List[str]
    correct: int
    explanation: str


class QuizResponse(BaseModel):
    id: UUID
    title: str
    questions: List[QuizQuestion]
    badge_reward: Optional[str]
    trigger_category: str


class QuizSubmit(BaseModel):
    answers: List[int]


# ─── Forecast ───
class ForecastResponse(BaseModel):
    id: UUID
    bill_name: str
    predicted_date: date
    predicted_amount: int
    currency: str
    confidence: float

    class Config:
        from_attributes = True


# ─── User Preferences ───
class PreferencesUpdate(BaseModel):
    language: Optional[str] = None
    currency: Optional[str] = None
    tone_preference: Optional[str] = None
    personality: Optional[str] = None
    notify_morning: Optional[bool] = None
    savings_target: Optional[int] = None


# ─── Insights ───
class DailyDigest(BaseModel):
    insight: str
    reflection_question: str
    total_spent_today: int
    budget_remaining: int
    mood: str  # green | yellow | red


class FinancialHealth(BaseModel):
    score: int  # 0-100
    mood: str  # green | yellow | red
    budget_used_percentage: float
    savings_progress_percentage: float
    streak_days: int
