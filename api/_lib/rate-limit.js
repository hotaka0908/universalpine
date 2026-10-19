const { createClient } = require('@vercel/kv');

let kv = null;

function getKv() {
  if (kv) return kv;
  const url = process.env.kv_KV_REST_API_URL || process.env.KV_REST_API_URL;
  const token = process.env.kv_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  kv = createClient({ url, token });
  return kv;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || 'unknown';
}

/**
 * IPアドレス単位のレート制限。
 * 制限内なら true、超過なら false を返す。
 * KVが未設定・エラー時は可用性を優先して通過させる。
 */
async function checkRateLimit(req, scope, { max = 5, windowSeconds = 600 } = {}) {
  const client = getKv();
  if (!client) return true;

  const key = `ratelimit:${scope}:${getClientIp(req)}`;
  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, windowSeconds);
    }
    return count <= max;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true;
  }
}

module.exports = { checkRateLimit, getClientIp };
