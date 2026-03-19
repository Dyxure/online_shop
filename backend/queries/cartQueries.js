const db = require("../src/db");

exports.getOrCreateCartIdBySession = async (sessionId) => {
  const existing = await db.query(
    `SELECT id FROM carts WHERE session_id=$1 ORDER BY id DESC LIMIT 1`,
    [sessionId]
  );
  if (existing.rows.length) return existing.rows[0].id;

  const created = await db.query(
    `INSERT INTO carts(session_id) VALUES($1) RETURNING id`,
    [sessionId]
  );
  return created.rows[0].id;
};

exports.getCartItemsByCartId = (cartId) => {
  return db.query(
    `
    SELECT
      ci.id,
      ci.variant_id,
      ci.quantity,
      p.name,
      p.price,
      p.image,
      s.name AS size,
      co.name AS color,
      pv.stock
    FROM cart_items ci
    JOIN product_variants pv ON pv.id = ci.variant_id
    JOIN products p ON p.id = pv.product_id
    LEFT JOIN sizes s ON s.id = pv.size_id
    LEFT JOIN colors co ON co.id = pv.color_id
    WHERE ci.cart_id=$1
    ORDER BY ci.id
    `,
    [cartId]
  );
};

exports.addToCart = async (cartId, variantId, qty) => {
  const exists = await db.query(
    `SELECT id FROM cart_items WHERE cart_id=$1 AND variant_id=$2`,
    [cartId, variantId]
  );

  if (exists.rows.length) {
    return db.query(
      `UPDATE cart_items
       SET quantity = quantity + $1
       WHERE id=$2`,
      [qty, exists.rows[0].id]
    );
  }

  return db.query(
    `INSERT INTO cart_items (cart_id, variant_id, quantity)
     VALUES ($1,$2,$3)`,
    [cartId, variantId, qty]
  );
};

exports.updateQty = (itemId, qty) => {
  return db.query(
    `UPDATE cart_items SET quantity=$1 WHERE id=$2`,
    [qty, itemId]
  );
};

exports.removeItem = (itemId) => {
  return db.query(
    `DELETE FROM cart_items WHERE id=$1`,
    [itemId]
  );
};

exports.clearCart = (cartId) => {
  return db.query(`DELETE FROM cart_items WHERE cart_id=$1`, [cartId]);
};