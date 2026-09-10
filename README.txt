EDIT BAR V15.2 — FULL WORKING FOUNDATION

This package combines the requested UI/settings upgrades and adds a real secure Owner login flow:
1) Owner enters name + password + Gmail.
2) Server verifies name/password.
3) Server sends a 6-digit OTP to the supplied Gmail through Gmail SMTP.
4) Owner enters the OTP.
5) Server verifies OTP and returns an 8-hour signed owner session token.

IMPORTANT: Real Gmail delivery requires a Gmail account with 2-Step Verification and a Google App Password. Never put the App Password, Owner password, or JWT secret in frontend code.

SETUP
1. Install Node.js 18+.
2. Open server/ and run: npm install
3. Copy server/.env.example to server/.env.
4. Set OWNER_NAME, OWNER_PASSWORD, OWNER_JWT_SECRET.
5. Configure Gmail SMTP with SMTP_USER and a Google App Password in SMTP_APP_PASSWORD.
6. Run: npm start
7. Open: http://localhost:8787

FEATURES IN THIS BUILD
- Owner Settings
- Secure Owner OTP login
- Update Manager
- 24 User Home categories
- Bulk Photo Upload UI for 1,000–2,000+ selections
- Resource Manager
- User Settings
- Notifications controls
- Favorites / history
- User management / ban controls
- Analytics UI
- PWA cache/version handling

PRODUCTION NOTE
The frontend-only parts are local UI/state features. To make multi-device users, cloud photos, real push notifications, real Google/Facebook OAuth, persistent analytics, and live app publishing fully production-grade, connect a real database, object storage/CDN, OAuth providers, and deployment pipeline. This package deliberately does not fake those services.
