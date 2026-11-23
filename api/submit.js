const { redis, KEY, configured } = require("./_redis");

const ALLOWED = new Set(Array.from({ length: 22 }, (_, i) => `q${i + 1}`));

function sanitize(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return null;
  const out = {};
  for (const [k, v] of Object.entries(answers)) {
    if (!ALLOWED.has(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 1000);
    else if (Array.isArray(v)) out[k] = v.filter((x) => typeof x === "string").slice(0, 20).map((x) => x.slice(0, 200));
    else if (v && typeof v === "object") {
      const g = {};
      for (const [rk, rv] of Object.entries(v).slice(0, 20)) {
        const n = Number(rv);
        if (Number.isInteger(n) && n >= 1 && n <= 5) g[String(rk).slice(0, 200)] = n;
      }
      out[k] = g;
    }
  }
  return Object.keys(out).length ? out : null;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!configured()) return res.status(503).json({ error: "Storage not configured" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }
  // Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if (body && body.website) return res.status(200).json({ ok: true });

  const answers = sanitize(body && body.answers);
  if (!answers) return res.status(400).json({ error: "No answers" });

  const record = { answers, version: 2, submittedAt: new Date().toISOString() };
  try {
    await redis(["RPUSH", KEY, JSON.stringify(record)]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Could not save" });
  }
};
