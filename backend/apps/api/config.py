"""Application configuration from environment."""

import os
import secrets

from dotenv import load_dotenv

load_dotenv()

# ─── Auth / JWT ───────────────────────────────────────────────────────────────
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

# ─── SMTP (Free email OTP — use Gmail App Password or any SMTP) ───────────────
SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER: str = os.getenv("SMTP_USER", "")
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM: str = os.getenv("SMTP_FROM", SMTP_HOST)

# OTP expiry in minutes
OTP_EXPIRE_MINUTES: int = int(os.getenv("OTP_EXPIRE_MINUTES", "10"))

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/bharat",
)

# AWS Bedrock (from env; do not hardcode credentials)
AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID: str | None = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY: str | None = os.getenv("AWS_SECRET_ACCESS_KEY")
BEDROCK_EMBEDDING_MODEL_ID: str = os.getenv(
    "BEDROCK_EMBEDDING_MODEL_ID",
    "amazon.titan-embed-text-v2:0",
)
BEDROCK_LLM_MODEL_ID: str = os.getenv(
    "BEDROCK_LLM_MODEL_ID",
    "amazon.titan-text-express-v1",
)
