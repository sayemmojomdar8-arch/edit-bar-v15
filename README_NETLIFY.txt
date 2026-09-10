EDIT BAR V15.1 — NETLIFY OTP FIX

এই সংস্করণটি Netlify-তে frontend + Netlify Functions দিয়ে Owner Gmail OTP চালানোর জন্য তৈরি।

NETLIFY ENVIRONMENT VARIABLES (Site configuration > Environment variables):
OWNER_NAME=SAYEM MOJOMDAE
OWNER_PASSWORD=আপনার Owner password
OWNER_EMAIL=sayemmojomdar8@gmail.com
OWNER_JWT_SECRET=একটি লম্বা random secret
OTP_TTL_MINUTES=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=sayemmojomdar8@gmail.com
SMTP_APP_PASSWORD=Google Account-এর 16-character App Password

IMPORTANT:
- Gmail account-এ 2-Step Verification চালু করে App Password তৈরি করতে হবে।
- সাধারণ Gmail password SMTP_APP_PASSWORD-এ দেবেন না।
- Deploy করার পর Site deploy নতুন করে trigger করুন যাতে Functions ও env variables load হয়।
- Owner login flow: Name + Password -> Gmail -> Send Gmail Code -> OTP -> Owner Panel.


IMPORTANT FIXES IN THIS BUILD:
- OTP is never stored in Netlify Blobs or server memory.
- OTP itself is not placed in the client-visible JWT challenge; only a SHA-256 hash is signed.
- OTP verification uses a timing-safe comparison.
- Deploy this build only after Netlify production deploys are available.


GOOGLE LOGIN SETUP
1. In Netlify Environment variables, add GOOGLE_CLIENT_ID = your Google OAuth Web Client ID.
2. Deploy again after saving the variable.
3. The site fetches the public Client ID and verifies the Google ID token in the Netlify Function /api/auth/google.
4. Keep the Google Client Secret private; this implementation does not put it in the browser.
5. Authorized JavaScript origin in Google Cloud must exactly match the live Netlify site URL.
