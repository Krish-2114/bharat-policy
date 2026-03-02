"""OTP-based Email Authentication Router — Free (SMTP/Gmail)."""

import random
import string
import smtplib
import logging
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt

from apps.api.config import (
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    JWT_EXPIRE_MINUTES,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
    OTP_EXPIRE_MINUTES,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

# ─── In-memory OTP store: { email: { otp, expires_at } } ─────────────────────
_otp_store: dict[str, dict] = {}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/verify-otp")


# ─── Schemas ──────────────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def _send_email(to_email: str, otp: str) -> None:
    """Send OTP via SMTP (works with Gmail, Outlook, or any free SMTP)."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Bharat Policy Twin OTP"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email

    text_body = f"Your OTP for Bharat Policy Twin is: {otp}\n\nThis OTP expires in {OTP_EXPIRE_MINUTES} minutes.\n\nIf you did not request this, please ignore."
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
        <div style="max-width: 480px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #FF6B35;">🇮🇳 Bharat Policy Twin</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 6px;">
            {otp}
          </div>
          <p style="color: #666; font-size: 13px; margin-top: 20px;">
            This OTP expires in <strong>{OTP_EXPIRE_MINUTES} minutes</strong>.<br>
            If you did not request this, please ignore this email.
          </p>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())
        logger.info(f"OTP email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {str(e)}")


def _create_jwt(email: str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


# ─── Dependency: get current user from JWT ────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """Validate JWT and return email."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/send-otp", summary="Send OTP to email")
def send_otp(body: SendOTPRequest):
    """
    Generate a 6-digit OTP and send it to the provided email address.
    Uses free SMTP (e.g., Gmail with App Password).
    """
    otp = _generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)

    _otp_store[body.email] = {"otp": otp, "expires_at": expires_at}

    _send_email(body.email, otp)

    return {"message": f"OTP sent to {body.email}. Expires in {OTP_EXPIRE_MINUTES} minutes."}


@router.post("/verify-otp", response_model=TokenResponse, summary="Verify OTP and get JWT")
def verify_otp(body: VerifyOTPRequest):
    """
    Verify the OTP for the given email. Returns a JWT access token on success.
    """
    record = _otp_store.get(body.email)

    if not record:
        raise HTTPException(status_code=400, detail="No OTP found for this email. Please request a new one.")

    if datetime.utcnow() > record["expires_at"]:
        _otp_store.pop(body.email, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if record["otp"] != body.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # OTP is valid — consume it
    _otp_store.pop(body.email, None)

    token = _create_jwt(body.email)
    return TokenResponse(access_token=token, email=body.email)


@router.get("/me", summary="Get current authenticated user")
def get_me(current_user: str = Depends(get_current_user)):
    """Returns the email of the currently authenticated user."""
    return {"email": current_user}
