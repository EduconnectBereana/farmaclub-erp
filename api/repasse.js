const crypto = require('crypto');

function setHeaders(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
}

function tokenPlain() {
  return crypto.randomBytes(32).toString('base64url');
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = async (req, res) => {
  setHeaders(res);

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const cronSecret = req.headers.authorization?.replace('Bearer ', '') || req.query?.secret;
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const token = tokenPlain();
  return res.status(200).json({
    ok: true,
    token_preview: token.slice(0, 8) + '...',
    token_hash: tokenHash(token),
    mensagem: 'Fluxo de repasse endurecido. Integrar consulta e persistência no banco.'
  });
};
