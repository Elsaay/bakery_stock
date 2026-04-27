CREATE DATABASE IF NOT EXISTS db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  image TEXT NULL,
  stock INT NOT NULL DEFAULT 0,
  status ENUM('available', 'unavailable') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_status (status)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  supplier_email VARCHAR(255) NOT NULL,
  message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_history (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  quantity_used INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stock_history_product_id (product_id),
  KEY idx_stock_history_created_at (created_at)
);

-- Exemples pour tester rapidement l'application :
-- INSERT INTO products (name, image, stock, status) VALUES
--   ('Croissant', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 24, 'available'),
--   ('Baguette', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73', 18, 'available'),
--   ('Pain au chocolat', 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f', 0, 'unavailable');
