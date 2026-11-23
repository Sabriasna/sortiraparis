const { configured } = require("./_redis");
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true, storage: configured() ? "connected" : "missing" });
};
