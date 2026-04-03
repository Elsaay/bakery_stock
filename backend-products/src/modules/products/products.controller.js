const db = require("../../config/db");

exports.getAllProducts = (req, res) => {
  const { search, status } = req.query;

  let query = "SELECT * FROM products WHERE 1=1";
  let params = [];

  if (search) {
    query += " AND name LIKE ?";
    params.push(`%${search}%`);
  }

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json(results);
  });
};


exports.createProduct = (req, res) => {
  const { name, image, stock} = req.body;
    const status = stock > 0 ? "available" : "unavailable";
  const query = "INSERT INTO products (name, image, stock, status) VALUES (?, ?, ?, ?)";

  db.query(query, [name, image, stock, status], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json({
      message: "Product created",
      id: result.insertId,
    });
  });
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json({ message: "Product deleted" });
  });
};

exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, image, stock} = req.body;
    const status = stock > 0 ? "available" : "unavailable";
    const query = `
        UPDATE products
        SET name = ?, image = ?, stock = ?, status = ?
        WHERE id = ?
    `;

    db.query(query, [name, image, stock, status, id], (err, result) => {
        if (err) {
        return res.status(500).json({ error: err });
        }

    res.json({ message: "Product updated" });
    });
};
