from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from phish_analyzer import analyze_email_header

app = FastAPI(
    title="Virtual SOC Lab API",
    description="Backend API for SOC Analyst Portfolio & Investigation Workbench",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailAnalysisRequest(BaseModel):
    raw_email: str

# Sample suspicious email for 1-click testing
SAMPLE_PHISHING_EMAIL = """Delivered-To: victim.user@company.com
Received: by 2002:a05:6e02:1889 with SMTP id x9csp3211512ilv;
        Mon, 2 Nov 2026 08:14:22 -0700 (PDT)
Return-Path: <bounce-daemon@evil-attacker-servers.ru>
Received: from mail.evil-attacker-servers.ru (mail.evil-attacker-servers.ru. [185.220.101.5])
        by mx.google.com with ESMTP id p12si2871923plb.124
        for <victim.user@company.com>;
        Mon, 2 Nov 2026 08:14:21 -0700 (PDT)
Received-SPF: fail (google.com: domain of support@paypal.com does not designate 185.220.101.5 as permitted sender) client-ip=185.220.101.5;
Authentication-Results: mx.google.com;
       spf=fail (google.com: domain of support@paypal.com does not designate 185.220.101.5 as permitted sender) smtp.mailfrom=bounce-daemon@evil-attacker-servers.ru;
       dkim=fail header.i=@paypal.com;
       dmarc=fail (p=REJECT sp=REJECT dis=NONE) header.from=paypal.com
From: "PayPal Security Team" <support@paypal.com>
To: victim.user@company.com
Subject: URGENT: Your PayPal Account Has Been Suspended - Action Required
Date: Mon, 2 Nov 2026 15:14:15 +0000

Dear Valued Customer,

We detected unauthorized login attempts to your PayPal account from an unrecognized IP location. For your security, your account has been temporarily locked.

Please verify your identity immediately within 24 hours to avoid permanent suspension:
https://paypal-account-verification-login.com/secure-portal/login.php

If you do not take action, your access will be terminated.

Security Team
PayPal Inc.
"""

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Virtual SOC Analyst Workbench",
        "message": "SOC Engine is running successfully!"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "active_modules": ["Phishing Email Analyzer (Module 1)", "Threat Intel (Pending)", "Log Analysis (Pending)"]
    }

@app.get("/api/sample-email")
def get_sample_email():
    """Provides a realistic sample phishing email header & body for testing"""
    return {
        "sample": SAMPLE_PHISHING_EMAIL
    }

@app.post("/api/analyze-phish")
def analyze_phish(payload: EmailAnalysisRequest):
    """Analyzes raw email header/content for phishing indicators"""
    if not payload.raw_email or len(payload.raw_email.strip()) == 0:
        raise HTTPException(status_code=400, detail="Email content cannot be empty.")
    
    result = analyze_email_header(payload.raw_email)
    return result
