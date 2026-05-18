import asyncio
import resend
from ..core.config import settings

resend.api_key = settings.resend_api_key

FROM_EMAIL = "onboarding@resend.dev"


async def send_verification_email(to_email: str, token: str) -> None:
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"
    payload = {
        "from": FROM_EMAIL,
        "to": to_email,
        "subject": "Confirmă adresa de email — Nutrition Tracker",
        "html": f"""
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
    }
    await asyncio.to_thread(resend.Emails.send, payload)


async def send_reset_password_email(to_email: str, token: str) -> None:
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    payload = {
        "from": FROM_EMAIL,
        "to": to_email,
        "subject": "Resetare parolă — Nutrition Tracker",
        "html": f"""
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
    }
    await asyncio.to_thread(resend.Emails.send, payload)
