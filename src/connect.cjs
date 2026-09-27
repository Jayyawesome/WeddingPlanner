const { createHash, timingSafeEqual } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { PipedreamClient } = require('@pipedream/sdk');
const digest = value => createHash('sha256').update(value).digest();

function createConnectHandler({ env = process.env, clientFactory = options => new PipedreamClient(options) } = {}) {
  let client;
  let lastCreated = 0;
  const origin = new URL(env.APP_ORIGIN || 'https://adorereve.com').origin;
  const required = ['PIPEDREAM_CLIENT_ID', 'PIPEDREAM_CLIENT_SECRET', 'CONNECT_ADMIN_PASSWORD'];
  function reply(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  }
  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== '/admin/integrations' && !url.pathname.startsWith('/api/pipedream/')) return false;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if (required.some(key => !env[key]) || env.CONNECT_ADMIN_PASSWORD.length < 24) {
      reply(res, 503, { error: 'Integrations are not configured yet. Ask the site owner to complete server setup.' });
      return true;
    }
    const credentials = (req.headers.authorization || '').startsWith('Basic ')
      ? Buffer.from(req.headers.authorization.slice(6), 'base64').toString('utf8') : '';
    if (!timingSafeEqual(digest(credentials), digest(`admin:${env.CONNECT_ADMIN_PASSWORD}`))) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Adorereve owner", charset="UTF-8"');
      reply(res, 401, { error: 'Owner sign-in required.' }); return true;
    }
    if (url.pathname === '/admin/integrations' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(__dirname, '../admin/integrations.html'))); return true;
    }
    if (url.pathname !== '/api/pipedream/connect' || req.method !== 'POST') {
      reply(res, 405, { error: 'Unsupported request.' }); return true;
    }
    // Basic auth is ambient: exact Origin and JSON requirements prevent browser CSRF.
    if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json') {
      reply(res, 403, { error: 'Request origin or format rejected.' }); return true;
    }
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body) > 2048) { reply(res, 413, { error: 'Request too large.' }); return true; }
    }
    let app;
    try { app = JSON.parse(body).app; } catch { reply(res, 400, { error: 'Invalid request.' }); return true; }
    if (typeof app !== 'string' || !/^[a-z][a-z0-9_]{1,63}$/.test(app)) {
      reply(res, 400, { error: 'Enter a valid Pipedream app slug.' }); return true;
    }
    if (Date.now() - lastCreated < 5000) { reply(res, 429, { error: 'Please wait a few seconds before trying again.' }); return true; }
    lastCreated = Date.now();
    try {
      client ||= clientFactory({ projectId: 'proj_ddsvbz5', projectEnvironment: 'production', clientId: env.PIPEDREAM_CLIENT_ID, clientSecret: env.PIPEDREAM_CLIENT_SECRET });
      const result = await client.tokens.create({ externalUserId: 'adorereve-owner', expiresIn: 600, allowedOrigins: [origin], successRedirectUri: `${origin}/admin/integrations` }, { timeoutInSeconds: 20, maxRetries: 0 });
      const link = new URL(result.connectLinkUrl);
      if (link.protocol !== 'https:' || link.hostname !== 'pipedream.com' || link.pathname !== '/_static/connect') throw new Error('Invalid Connect destination');
      link.searchParams.set('app', app);
      reply(res, 200, { connectLinkUrl: link.href });
    } catch {
      // Provider errors may contain credentials; never expose them in responses or logs.
      reply(res, 502, { error: 'Pipedream could not start the connection. Check your server credentials and project access, then try again.' });
    }
    return true;
  };
}
module.exports = { createConnectHandler };
