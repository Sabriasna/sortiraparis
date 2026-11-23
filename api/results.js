const crypto = require("crypto");
const { redis, KEY, configured } = require("./_redis");

// SHA-256 of the group's results password (the password itself is not stored here).
// Setting RESULTS_PASSWORD in Vercel overrides it.
const DEFAULT_HASH = "62d79bc720065d1ea80cf9681632471cdb05c302a9481bfe2da6446148c21372";

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();

function isAuthorized(given) {
  if (!given) return false;
  const expected = process.env.RESULTS_PASSWORD ? sha(process.env.RESULTS_PASSWORD) : Buffer.from(DEFAULT_HASH, "hex");
  return crypto.timingSafeEqual(sha(given), expected);
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const given = req.headers["x-results-key"] || "";
  if (!isAuthorized(given)) return res.status(401).json({ error: "Unauthorized" });
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
