const db = require("../../config/db");

exports.createOrder = (req, res) => {
  const { supplier_email, message, items } = req.body;

  db.query(
    "INSERT INTO orders (supplier_email, message) VALUES (?, ?)",
    [supplier_email, message],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const orderId = result.insertId;

      try {
        for (const item of items) {
          const { product_id, quantity } = item;

          await new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
              [orderId, product_id, quantity],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }

        res.json({
          message: "Order created",
          orderId,
        });

      } catch (error) {
        res.status(500).json({ error });
      }
    }
  );
};

exports.getOrders = (req, res) => {
  db.query(`
    SELECT
      o.id AS order_id,
      o.supplier_email,
      o.message,
      o.created_at,
      oi.product_id,
      oi.quantity,
      p.name AS product_name
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    const ordersMap = {};

    results.forEach(row => {

      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          supplier_email: row.supplier_email,
          message: row.message,
          created_at: row.created_at,
          items: []
        };
      }

      if (row.product_id) {
        ordersMap[row.order_id].items.push({
          product_id: row.product_id,
          product_name: row.product_name,
          quantity: row.quantity
        });
      }
    });

    const orders = Object.values(ordersMap);

    res.json(orders);
  });
};
