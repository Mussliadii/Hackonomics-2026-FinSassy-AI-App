import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, BigInteger, Float, Boolean, Date,
    DateTime, ForeignKey, Text, JSON, TypeDecorator
)
from sqlalchemy.orm import relationship
from database import Base


class GUID(TypeDecorator):
    """Platform-independent UUID type. Uses String(36) for SQLite, native UUID for PostgreSQL."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return uuid.UUID(value) if not isinstance(value, uuid.UUID) else value
        return value


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer)
    personality = Column(String, default="casual")  # casual | ambitious | chill
    tone_preference = Column(String, default="mild")  # mild | spicy | extra
    language = Column(String(2), default="en")  # en | id | zh
    currency = Column(String(3), default="USD")  # USD | IDR | CNY
    savings_target = Column(BigInteger, default=0)
    notify_morning = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="user")
    roast_history = relationship("RoastHistory", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")
    articles = relationship("Article", back_populates="user")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    raw_text = Column(String)
    amount = Column(BigInteger, nullable=False)  # cents / smallest unit
    currency = Column(String(3), default="USD")
    type = Column(String, nullable=False)  # income | expense
    category_id = Column(String, nullable=True)
    ml_confidence = Column(Float, default=0.0)
    is_user_corrected = Column(Boolean, default=False)
    is_anomaly = Column(Boolean, default=False)
    transaction_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True)
    name_en = Column(String, nullable=False)
    name_id = Column(String, nullable=False)
    name_zh = Column(String, nullable=False)
    icon = Column(String)
    parent_id = Column(String, ForeignKey("categories.id"), nullable=True)
    is_default = Column(Boolean, default=True)


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    bill_name = Column(String)
    predicted_date = Column(Date)
    predicted_amount = Column(BigInteger)
    currency = Column(String(3))
    confidence = Column(Float)
    is_notified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Badge(Base):
    __tablename__ = "badges"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False)
    name_en = Column(String)
    name_id = Column(String)
    name_zh = Column(String)
    description_en = Column(String)
    description_id = Column(String)
    description_zh = Column(String)
    icon_url = Column(String)
    criteria_type = Column(String)  # quiz_count, savings_streak, roast_count
    criteria_value = Column(Integer)


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    badge_id = Column(GUID(), ForeignKey("badges.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    trigger_category = Column(String)
    questions_json = Column(JSON)
    answers_json = Column(JSON)
    score = Column(Integer)
    total = Column(Integer)
    language = Column(String(2))
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")


class RoastHistory(Base):
    __tablename__ = "roast_history"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    roast_text = Column(Text)
    tone = Column(String)
    language = Column(String(2))
    data_summary = Column(JSON)
    was_shared = Column(Boolean, default=False)
    share_platform = Column(String, nullable=True)
    tip_clicked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="roast_history")


class Article(Base):
    __tablename__ = "articles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    topic = Column(String)
    content = Column(Text)
    language = Column(String(2))
    trigger_category = Column(String)
    was_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="articles")


class LearningStreak(Base):
    __tablename__ = "learning_streaks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity = Column(Date)
