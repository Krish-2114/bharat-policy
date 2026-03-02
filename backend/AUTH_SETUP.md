# OTP Authentication — Setup Guide

## Overview

This adds **free email OTP authentication** to Bharat Policy Twin using:
- **SMTP email** (Gmail free tier) — no paid service needed
- **6-digit OTP** valid for 10 minutes
- **JWT tokens** for authenticated sessions

---

## New Files Added

| File | Purpose |
|---|---|
| `apps/api/routers/auth.py` | All auth endpoints |
| `apps/api/config.py` | Updated with JWT + SMTP config |
| `requirements.txt` | Added `python-jose`, `passlib` |
| `.env` | Auth environment variables |

---

## Setup: Gmail App Password (Free)

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification**
3. Go to **App Passwords** → generate one for "Mail"
4. Copy the 16-character password

Then in your `.env`:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop   # the app password (spaces OK)
SMTP_FROM=your-email@gmail.com
JWT_SECRET_KEY=generate-with-python-secrets-token-hex-32
```

> **Alternatives to Gmail:** Outlook (smtp.office365.com:587), Zoho (smtp.zoho.com:587), Mailtrap (for dev/testing).

---

## API Endpoints

### 1. Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{ "email": "user@example.com" }
```
**Response:**
```json
{ "message": "OTP sent to user@example.com. Expires in 10 minutes." }
```

---

### 2. Verify OTP → Get JWT
```http
POST /auth/verify-otp
Content-Type: application/json

{ "email": "user@example.com", "otp": "483921" }
```
**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "email": "user@example.com"
}
```

---

### 3. Check Auth (Protected Route)
```http
GET /auth/me
Authorization: Bearer eyJ...
```
**Response:**
```json
{ "email": "user@example.com" }
```

---

## Protecting Your Existing Routes

To require authentication on any route, add the `Depends(get_current_user)` dependency:

```python
from apps.api.routers.auth import get_current_user
from fastapi import Depends

@router.post("/your-protected-route")
def my_route(body: MyRequest, current_user: str = Depends(get_current_user)):
    # current_user is the authenticated email
    ...
```

---

## Flow Diagram

```
User enters email
      ↓
POST /auth/send-otp  →  OTP emailed (free via Gmail SMTP)
      ↓
User checks email, enters OTP
      ↓
POST /auth/verify-otp  →  Returns JWT token
      ↓
Store token in frontend (localStorage / cookie)
      ↓
All API calls: Authorization: Bearer <token>
```

---

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET_KEY` | random (insecure) | **Change this!** Use `secrets.token_hex(32)` |
| `JWT_EXPIRE_MINUTES` | 60 | JWT validity |
| `SMTP_HOST` | smtp.gmail.com | SMTP server |
| `SMTP_PORT` | 587 | SMTP port (587=STARTTLS) |
| `SMTP_USER` | — | Your email login |
| `SMTP_PASSWORD` | — | Gmail App Password |
| `SMTP_FROM` | — | Sender address |
| `OTP_EXPIRE_MINUTES` | 10 | OTP validity window |
