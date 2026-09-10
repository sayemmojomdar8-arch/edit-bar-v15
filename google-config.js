exports.handler = async () => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  return { statusCode:200, headers:{'content-type':'application/json','cache-control':'no-store'}, body:JSON.stringify({ok:true, clientId}) };
};
