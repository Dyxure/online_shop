const db = require("../src/db");

exports.createOrder = (total) => {
  return db.query(
    `INSERT INTO orders(total,status)
     VALUES($1,'new')
     RETURNING id`,
    [total]
  );
};

exports.addItem = (orderId, variantId, price, qty) => {
  return db.query(
    `INSERT INTO order_items
     (order_id, variant_id, price, quantity)
     VALUES($1,$2,$3,$4)`,
    [orderId, variantId, price, qty]
  );
};