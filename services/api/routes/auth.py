from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import SignupRequest, LoginRequest, TokenResponse, UserResponse, OTPRequest, OTPVerify
from utils.jwt_handler import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user_id,
)
from utils.security import sanitize_input, validate_language, validate_currency, validate_password
from utils.otp_service import generate_otp, store_otp, verify_otp, send_otp_email

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup/send-otp")
async def send_signup_otp(req: SignupRequest, db: Session = Depends(get_db)):
    """Validate signup data and send OTP to email."""
    if not validate_language(req.language):
        raise HTTPException(400, "Invalid language. Use: en, id, zh")
    if not validate_currency(req.currency):
        raise HTTPException(400, "Invalid currency. Use: USD, IDR, CNY")

    pw_errors = validate_password(req.password)
    if pw_errors:
        raise HTTPException(400, "; ".join(pw_errors))

    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(409, "Email already registered")

    code = generate_otp()
    store_otp(req.email, code, req.model_dump())
    send_otp_email(req.email, code)

    return {"message": "OTP sent to email", "email": req.email}


@router.post("/signup/verify-otp", response_model=TokenResponse)
async def verify_signup_otp(req: OTPVerify, db: Session = Depends(get_db)):
    """Verify OTP and create user account."""
    data = verify_otp(req.email, req.code)
    if not data:
        raise HTTPException(400, "Invalid or expired OTP code")

    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(409, "Email already registered")

    user = User(
        email=data["email"],
        password_hash=hash_password(data["password"]),
        name=sanitize_input(data["name"], 100),
        age=data.get("age"),
        language=data.get("language", "en"),
        currency=data.get("currency", "USD"),
        personality=data.get("personality", "casual"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/signup", response_model=TokenResponse)
async def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if not validate_language(req.language):
        raise HTTPException(400, "Invalid language. Use: en, id, zh")
    if not validate_currency(req.currency):
        raise HTTPException(400, "Invalid currency. Use: USD, IDR, CNY")

    pw_errors = validate_password(req.password)
    if pw_errors:
        raise HTTPException(400, "; ".join(pw_errors))

    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(409, "Email already registered")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        name=sanitize_input(req.name, 100),
        age=req.age,
        language=req.language,
        currency=req.currency,
        personality=req.personality,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401, "User not found")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user
