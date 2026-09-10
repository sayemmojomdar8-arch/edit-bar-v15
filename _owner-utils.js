const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Netlify Functions are serverless and may run on different instances.
// OTPs therefore must NOT live only in process memory.
const configuredMinutes = Number(process.env.OTP_TTL_MINUTES || 15);
const OTP_TTL = Math.max(Number.isFinite(configuredMinutes) ? configuredMinutes : 15, 15) * 60 * 1000;
const MAX_ATTEMPTS = 5;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function envReady() {
  const required = ['OWNER_NAME', 'OWNER_PASSWORD', 'OWNER_JWT_SECRET', 'OWNER_EMAIL', 'SMTP_USER', 'SMTP_APP_PASSWORD'];
  return required.filter(k => !process.env[k]);
}

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_APP_PASSWORD }
  });
}

function key(name, email) { return `owner-otp:${name.toLowerCase()}::${email.toLowerCase()}`; }

function ownerMatches(name, password) {
  return name === process.env.OWNER_NAME && password === process.env.OWNER_PASSWORD;
}

function makeOtp() { return String(crypto.randomInt(100000, 1000000)); }

function corsHeaders() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST,OPTIONS' }; }


function hashOtp(otp) { return crypto.createHash('sha256').update(String(otp)).digest('hex'); }
function challengeKey() {
  return crypto.createHash('sha256').update(String(process.env.OWNER_JWT_SECRET)).digest();
}
function makeOtpChallenge(name, email, otp) {
  // Encrypt the OTP inside the challenge. A signed JWT containing an OTP hash would
  // allow offline brute-force guessing because the OTP has only 900,000 possibilities.
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', challengeKey(), iv);
  const payload = JSON.stringify({ type: 'owner-otp', name, email, otp, iat: Date.now() });
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const exp = Date.now() + OTP_TTL;
  return [iv, tag, encrypted, Buffer.from(String(exp))].map(b => b.toString('base64url')).join('.');
}
function verifyOtpChallenge(challenge) {
  const parts = String(challenge || '').split('.');
  if (parts.length !== 4) throw new Error('Invalid challenge');
  const [ivB64, tagB64, dataB64, expB64] = parts;
  const exp = Number(Buffer.from(expB64, 'base64url').toString('utf8'));
  if (!Number.isFinite(exp) || Date.now() > exp) throw new Error('Expired challenge');
  const decipher = crypto.createDecipheriv('aes-256-gcm', challengeKey(), Buffer.from(ivB64, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64url')), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}
function otpMatches(otp, expectedOtp) {
  const a = Buffer.from(String(otp));
  const b = Buffer.from(String(expectedOtp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { OTP_TTL, MAX_ATTEMPTS, json, envReady, transport, key, ownerMatches, makeOtp, corsHeaders, jwt, makeOtpChallenge, verifyOtpChallenge, otpMatches };
