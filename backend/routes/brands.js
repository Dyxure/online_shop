const router = require("express").Router();
const db = require("../src/db");

router.get("/", async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM brands ORDER BY id");
    res.json(data.rows);
  } catch (err) {
    console.error("Brands fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

