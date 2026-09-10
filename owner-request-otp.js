const { OTP_TTL, json, envReady, transport, ownerMatches, makeOtp, corsHeaders, makeOtpChallenge } = require('./_owner-utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(), body: '' };
  if (event.httpMethod !== 'POST') return { ...json(405, { error: 'Method not allowed' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  const missing = envReady();
  if (missing.length) return { ...json(500, { error: 'Owner login server is not configured: ' + missing.join(', ') }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  let body; try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const name = String(body.name || '').trim();
  const password = String(body.password || '');
  const email = String(body.email || '').trim().toLowerCase();
  if (!name || !password || !email) return { ...json(400, { error: 'Name, password and Gmail are required.' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  if (!ownerMatches(name, password)) return { ...json(401, { error: 'Owner name or password is incorrect.' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  if (email !== String(process.env.OWNER_EMAIL || '').trim().toLowerCase()) return { ...json(403, { error: 'This Gmail is not authorized for Owner login.' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  const otp = makeOtp();
  const challenge = makeOtpChallenge(name, email, otp);
  try {
    await transport().sendMail({
      from: `Edit Bar V15 Owner <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Edit Bar V15 — Owner Verification Code',
      text: `Your Edit Bar V15 Owner verification code is: ${otp}\n\nThis code expires in ${Math.max(Number(process.env.OTP_TTL_MINUTES || 15), 15)} minutes.`,
      html: `<h2>Edit Bar V15</h2><p>Your Owner verification code is:</p><h1>${otp}</h1><p>It expires in ${Math.max(Number(process.env.OTP_TTL_MINUTES || 15), 15)} minutes.</p>`
    });
  } catch (err) {
    return { ...json(502, { error: 'Gmail could not send the verification code. Check SMTP_USER and Gmail App Password.' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  }
  return { ...json(200, { ok: true, message: 'Verification code sent.', challenge }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
};
