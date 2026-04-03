const db = require("../../config/db");

exports.useStock = (req, res) => {
  const items = req.body;

  items.forEach((item) => {
    const { product_id, quantity } = item;

    db.query(
      "SELECT stock FROM products WHERE id = ?",
      [product_id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0) {
          return res.status(404).json({ message: "Product not found" });
        }

        const currentStock = results[0].stock;
        const newStock = currentStock - quantity;

        if (newStock < 0) {
          return res.status(400).json({
            message: `Not enough stock for product ${product_id}`,
          });
        }

        const status = newStock > 0 ? "available" : "unavailable";

        db.query(
          "UPDATE products SET stock = ?, status = ? WHERE id = ?",
          [newStock, status, product_id]
        );

        db.query(
          "INSERT INTO stock_history (product_id, quantity_used) VALUES (?, ?)",
          [product_id, quantity]
        );
      }
    );
  });

  res.json({ message: "Stock updated + history saved" });
};
