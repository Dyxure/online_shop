const router = require("express").Router();
const db = require("../src/db");

router.get("/", async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM colors ORDER BY id");
    res.json(data.rows);
  } catch (err) {
    console.error("Colors fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

