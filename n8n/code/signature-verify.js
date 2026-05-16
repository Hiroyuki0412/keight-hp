/**
 * LINE Webhook 署名検証（n8n Code ノード用）
 * require('crypto') は禁止のため Web Crypto API を使用
 */
const secret = $env.LINE_CHANNEL_SECRET;
if (!secret) {
  throw new Error('環境変数 LINE_CHANNEL_SECRET を設定してください');
}

const item = $input.first().json;
const headers = item.headers || {};
const signature = headers['x-line-signature'] || headers['X-Line-Signature'];

if (!signature) {
  return [{ json: { valid: false, reason: 'missing_signature', events: [] } }];
}

const rawBody = item.rawBody;
let bodyString;

if (typeof rawBody === 'string') {
  bodyString = rawBody;
} else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(rawBody)) {
  bodyString = rawBody.toString('utf8');
} else if (rawBody && rawBody.type === 'Buffer' && Array.isArray(rawBody.data)) {
  bodyString = Buffer.from(rawBody.data).toString('utf8');
} else {
  bodyString = JSON.stringify(item.body ?? item);
}

async function hmacSha256Base64(key, message) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

return (async () => {
  const hash = await hmacSha256Base64(secret, bodyString);
  const valid = hash === signature;

  let payload = {};
  try {
    payload = JSON.parse(bodyString);
  } catch {
    payload = item.body ?? item;
  }

  return [
    {
      json: {
        valid,
        reason: valid ? 'ok' : 'invalid_signature',
        events: payload.events || [],
        destination: payload.destination ?? null,
      },
    },
  ];
})();
