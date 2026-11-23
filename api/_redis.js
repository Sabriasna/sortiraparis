// Minimal Upstash Redis REST client (no dependencies).
// Vercel's Upstash integration injects KV_REST_API_URL / KV_REST_API_TOKEN
// (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
// Falls back to any <PREFIX>_REST_API_URL / <PREFIX>_REST_API_TOKEN pair,
// whatever custom prefix was chosen when connecting the database.
function findEnv(suffix) {
  const key = Object.keys(process.env).find((k) => k.endsWith(suffix) && !k.includes("READ_ONLY"));
  return key ? process.env[key] : undefined;
}
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || findEnv("_REST_API_URL");
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || findEnv("_REST_API_TOKEN");

const KEY = "mazette:responses";

async function redis(command) {
  if (!URL_ || !TOKEN) throw new Error("Redis not configured");
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const data = await r.json();
  if (!r.ok || data.error) throw new Error(data.error || `Redis HTTP ${r.status}`);
  return data.result;
}

module.exports = { redis, KEY, configured: () => Boolean(URL_ && TOKEN) };
