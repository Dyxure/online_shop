const queries = require("../queries/cartQueries");
const db = require("../src/db");

exports.getCart = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

    const cartId = await queries.getOrCreateCartIdBySession(sessionId);
    const items = await queries.getCartItemsByCartId(cartId);
    res.json({ cartId, items: items.rows });
  } catch (err) {
    console.error("Cart fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addToCart = async (req, res) => {
  const { sessionId, variantId, qty } = req.body;

  try {
    if (!sessionId) return res.status(400).json({ error: "sessionId is required" });
    if (!variantId) return res.status(400).json({ error: "variantId is required" });
    const safeQty = Math.max(1, Number(qty || 1));

    const cartId = await queries.getOrCreateCartIdBySession(sessionId);

    const variant = await db.query(
      `SELECT id, stock FROM product_variants WHERE id=$1`,
      [variantId]
    );
    if (!variant.rows.length) return res.status(400).json({ error: "Variant not found" });
    if (variant.rows[0].stock <= 0) return res.status(400).json({ error: "Out of stock" });

    await queries.addToCart(cartId, variantId, safeQty);
    res.json({ ok: true });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.update = async (req, res) => {
  const { itemId, qty } = req.body;
  try {
    const safeQty = Math.max(1, Number(qty || 1));
    await queries.updateQty(itemId, safeQty);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.remove = async (req, res) => {
  const { itemId } = req.body;
  try {
    await queries.removeItem(itemId);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};