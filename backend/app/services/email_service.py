import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from ..core.config import settings


def _send_email(to_email: str, subject: str, html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.gmail_user
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
        server.starttls()
        server.login(settings.gmail_user, settings.gmail_app_password)
        server.sendmail(settings.gmail_user, to_email, msg.as_string())


async def send_verification_email(to_email: str, token: str) -> None:
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #8fc63e;">Bun venit la Nutrition Tracker!</h2>
        <p>Apasă butonul de mai jos pentru a-ți confirma adresa de email:</p>
        <a href="{verify_url}"
           style="display:inline-block; background:#8fc63e; color:white; padding:12px 24px;
                  border-radius:12px; text-decoration:none; font-weight:bold; margin:16px 0;">
            Confirmă emailul
        </a>
        <p style="color:#888; font-size:12px;">Link-ul expiră în 24 de ore.</p>
    </div>
    """
    await asyncio.to_thread(_send_email, to_email, "Confirmă adresa de email — Nutrition Tracker", html)


async def send_reset_password_email(to_email: str, token: str) -> None:
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #8fc63e;">Resetare parolă</h2>
        <p>Ai solicitat resetarea parolei. Apasă butonul de mai jos:</p>
        <a href="{reset_url}"
           style="display:inline-block; background:#8fc63e; color:white; padding:12px 24px;
                  border-radius:12px; text-decoration:none; font-weight:bold; margin:16px 0;">
            Resetează parola
        </a>
        <p style="color:#888; font-size:12px;">Link-ul expiră în 1 oră. Dacă nu ai solicitat resetarea, ignoră acest email.</p>
    </div>
    """
    await asyncio.to_thread(_send_email, to_email, "Resetare parolă — Nutrition Tracker", html)
