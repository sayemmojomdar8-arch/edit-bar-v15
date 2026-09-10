const { json, envReady, jwt, corsHeaders, verifyOtpChallenge, otpMatches } = require('./_owner-utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(), body: '' };
  if (event.httpMethod !== 'POST') return { ...json(405, { error: 'Method not allowed' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  const missing = envReady();
  if (missing.length) return { ...json(500, { error: 'Owner login server is not configured: ' + missing.join(', ') }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  let body; try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const otp = String(body.otp || '').trim();
  const challenge = String(body.challenge || '');
  if (!challenge || !otp) return { ...json(400, { error: 'Verification code is required. Send a new code if needed.' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  let claims;
  try { claims = verifyOtpChallenge(challenge); }
  catch { return { ...json(400, { error: 'Code expired or not requested. Send a new code.' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }; }
  if (claims?.type !== 'owner-otp' || claims.name !== name || String(claims.email || '').toLowerCase() !== email) {
    return { ...json(401, { error: 'Verification request does not match. Send a new code.' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  }
  if (!otpMatches(otp, claims.otp)) return { ...json(401, { error: 'Incorrect verification code.' }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
  const token = jwt.sign({ role: 'owner', name, email }, process.env.OWNER_JWT_SECRET, { expiresIn: '8h' });
  return { ...json(200, { ok: true, token, expiresIn: 28800 }), headers: { ...corsHeaders(), 'Content-Type': 'application/json' } };
};
