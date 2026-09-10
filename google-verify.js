const { OAuth2Client } = require('google-auth-library');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok:false, error:'Method not allowed' });
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  if (!clientId) return json(500, { ok:false, error:'Google login is not configured: GOOGLE_CLIENT_ID' });
  try {
    const body = JSON.parse(event.body || '{}');
    const credential = String(body.credential || '');
    if (!credential) return json(400, { ok:false, error:'Google credential missing' });
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const p = ticket.getPayload();
    if (!p || !p.sub || !p.email || p.email_verified !== true) return json(401, { ok:false, error:'Google account could not be verified' });
    return json(200, { ok:true, user:{ id:p.sub, email:p.email.toLowerCase(), name:p.name || p.email.split('@')[0], picture:p.picture || '', provider:'Google' } });
  } catch (e) {
    return json(401, { ok:false, error:'Invalid Google sign-in credential' });
  }
};
function json(status, data){ return { statusCode:status, headers:{'content-type':'application/json','cache-control':'no-store'}, body:JSON.stringify(data) }; }
