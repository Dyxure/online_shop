const db = require("../src/db");
const cartQueries = require("../queries/cartQueries");

exports.list = async (req, res) => {
  try {
    const data = await db.query(
      `SELECT id, created_at, total, status
       FROM orders
       ORDER BY created_at DESC, id DESC
       LIMIT 100`
    );
    res.json(data.rows);
  } catch (err) {
    console.error("Orders list error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getOne = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid order id" });

  try {
    const order = await db.query(
      `SELECT id, created_at, total, status
       FROM orders
       WHERE id=$1`,
      [id]
    );
    if (!order.rows.length) return res.status(404).json({ error: "Order not found" });

    const items = await db.query(
      `
      SELECT
        oi.id,
        oi.variant_id,
        oi.price,
        oi.quantity,
        p.name,
        p.image,
        s.name AS size,
        co.name AS color
      FROM order_items oi
      JOIN product_variants pv ON pv.id = oi.variant_id
      JOIN products p ON p.id = pv.product_id
      LEFT JOIN sizes s ON s.id = pv.size_id
      LEFT JOIN colors co ON co.id = pv.color_id
      WHERE oi.order_id=$1
      ORDER BY oi.id
      `,
      [id]
    );

    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    console.error("Order getOne error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.create = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const cartId = await cartQueries.getOrCreateCartIdBySession(sessionId);

    const cartItems = await client.query(
      `
      SELECT
        ci.id AS cart_item_id,
        ci.variant_id,
        ci.quantity,
        pv.stock,
        p.price
      FROM cart_items ci
      JOIN product_variants pv ON pv.id = ci.variant_id
      JOIN products p ON p.id = pv.product_id
      WHERE ci.cart_id=$1
      ORDER BY ci.id
      FOR UPDATE
      `,
      [cartId]
    );

    if (!cartItems.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

    for (const row of cartItems.rows) {
      if (row.quantity <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid quantity in cart" });
      }
      if (row.stock < row.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Not enough stock",
          variantId: row.variant_id,
          requested: row.quantity,
          stock: row.stock,
        });
      }
    }

    const total = cartItems.rows.reduce(
      (sum, r) => sum + Number(r.price) * Number(r.quantity),
      0
    );

    const order = await client.query(
      `INSERT INTO orders(total, status) VALUES($1, 'new') RETURNING id`,
      [total]
    );
    const orderId = order.rows[0].id;

    for (const row of cartItems.rows) {
      await client.query(
        `
        INSERT INTO order_items (order_id, variant_id, price, quantity)
        VALUES ($1, $2, $3, $4)
        `,
        [orderId, row.variant_id, row.price, row.quantity]
      );

      await client.query(
        `UPDATE product_variants SET stock = stock - $1 WHERE id=$2`,
        [row.quantity, row.variant_id]
      );
    }

    await client.query(`DELETE FROM cart_items WHERE cart_id=$1`, [cartId]);

    await client.query("COMMIT");
    res.json({ ok: true, orderId, total });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore
    }
    console.error("Order create error:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};