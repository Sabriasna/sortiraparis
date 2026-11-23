const crypto = require("crypto");
const { redis, KEY, configured } = require("./_redis");

function sameSecret(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const secret = process.env.RESULTS_PASSWORD;
  if (!secret) return res.status(503).json({ error: "RESULTS_PASSWORD not set" });
  const given = req.headers["x-results-key"] || "";
  if (!given || !sameSecret(given, secret)) return res.status(401).json({ error: "Unauthorized" });
  if (!configured()) return res.status(503).json({ error: "Storage not configured" });

  try {
    const raw = (await redis(["LRANGE", KEY, "0", "-1"])) || [];
    const responses = raw.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
    return res.status(200).json({ count: responses.length, responses });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Could not read" });
  }
};
