import random
import string
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from config import get_settings

# In-memory OTP store: {email: {"code": str, "expires": float, "data": dict}}
_otp_store: dict = {}
OTP_EXPIRY_SECONDS = 300  # 5 minutes


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def store_otp(email: str, code: str, signup_data: dict) -> None:
    _otp_store[email] = {
        "code": code,
        "expires": time.time() + OTP_EXPIRY_SECONDS,
        "data": signup_data,
    }


def verify_otp(email: str, code: str) -> Optional[dict]:
    entry = _otp_store.get(email)
    if not entry:
        return None
    if time.time() > entry["expires"]:
        del _otp_store[email]
        return None
    if entry["code"] != code:
        return None
    data = entry["data"]
    del _otp_store[email]
    return data


def send_otp_email(email: str, code: str) -> bool:
    settings = get_settings()

    if not settings.SMTP_HOST:
        # Dev mode: print OTP to console
        print(f"📧 [DEV] OTP for {email}: {code}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"FinSassy AI - Your verification code: {code}"
        msg["From"] = settings.SMTP_FROM
        msg["To"] = email

        html = f"""
        <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #6366f1; font-size: 24px; margin: 0;">FinSassy AI</h1>
                <p style="color: #94a3b8; font-size: 14px;">Smart Money, Sassy Insights</p>
            </div>
            <div style="background: #1e293b; border-radius: 16px; padding: 32px; text-align: center;">
                <p style="color: #e2e8f0; font-size: 16px; margin-bottom: 24px;">
                    Your verification code is:
                </p>
                <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6366f1;">
                        {code}
                    </span>
                </div>
                <p style="color: #94a3b8; font-size: 13px;">
                    This code expires in 5 minutes. Do not share it with anyone.
                </p>
            </div>
        </div>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, email, msg.as_string())
        return True
    except Exception as e:
        print(f"❌ Email send failed: {e}")
        # Fallback to console in case of error
        print(f"📧 [FALLBACK] OTP for {email}: {code}")
        return True
