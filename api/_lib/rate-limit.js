const { createClient } = require('@vercel/kv');

let kv = null;
let warnedMissingKv = false;

function getKv() {
  if (kv) return kv;
  const url = process.env.kv_KV_REST_API_URL || process.env.KV_REST_API_URL;
  const token = process.env.kv_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    if (!warnedMissingKv) {
      console.warn('Rate limiting disabled: KV_REST_API_URL / KV_REST_API_TOKEN are not configured');
      warnedMissingKv = true;
    }
    return null;
  }
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
 *
 * 初回は SET NX EX で「カウンタ作成」と「有効期限設定」を1回のコマンドで行い、
 * 有効期限のないカウンタが残って恒久的にブロックされる状態を防ぐ。
 */
async function checkRateLimit(req, scope, { max = 5, windowSeconds = 600 } = {}) {
  const client = getKv();
  if (!client) return true;

  const key = `ratelimit:${scope}:${getClientIp(req)}`;
  try {
    const created = await client.set(key, 1, { nx: true, ex: windowSeconds });
    if (created === 'OK') {
      return max >= 1;
    }
    const count = await client.incr(key);
    return count <= max;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true;
  }
}

module.exports = { checkRateLimit, getClientIp };
