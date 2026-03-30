import re
from typing import Optional, List


# PII patterns to mask before sending to LLM
PII_PATTERNS = [
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]'),
    (r'\b\d{10,16}\b', '[ACCOUNT]'),
    (r'\b\d{3}[-.\s]?\d{3,4}[-.\s]?\d{4}\b', '[PHONE]'),
    (r'\b\d{16}\b', '[CARD]'),
]


def validate_password(password: str) -> List[str]:
    """Validate password strength. Returns list of error messages (empty = valid)."""
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain an uppercase letter")
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain a lowercase letter")
    if not re.search(r'[0-9]', password):
        errors.append("Password must contain a number")
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
        errors.append("Password must contain a special character")
    return errors


def mask_pii(text: str) -> str:
    """Mask personally identifiable information before sending to LLM."""
    masked = text
    for pattern, replacement in PII_PATTERNS:
        masked = re.sub(pattern, replacement, masked)
    return masked


def validate_currency(currency: str) -> bool:
    return currency in ("USD", "IDR", "CNY")


def validate_language(language: str) -> bool:
    return language in ("en", "id", "zh")


def validate_tone(tone: str) -> bool:
    return tone in ("mild", "spicy", "extra")


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent injection attacks."""
    if not text:
        return ""
    # Strip null bytes
    text = text.replace('\x00', '')
    # Limit length
    text = text[:max_length]
    return text.strip()
