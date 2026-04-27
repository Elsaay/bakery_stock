-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 27 avr. 2026 à 15:09
-- Version du serveur : 9.1.0
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `boulangerie_bdd`
--

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`id`, `supplier_email`, `message`, `created_at`) VALUES
(1, 'fournisseur@gmail.com', 'Commande urgente', '2026-03-21 18:58:20'),
(2, 'fournisseur@gmail.com', 'Commande urgente', '2026-03-21 19:05:25'),
(3, 'fournisseur@gmail.com', 'Commande', '2026-03-21 19:09:06'),
(4, 'fournisseur@gmail.com', 'Commande 3', '2026-03-21 19:12:46'),
(5, 'fournisseur@gmail.com', 'Commande trois', '2026-03-21 19:13:08'),
(6, 'fournisseur@gmail.com', 'Commande 3', '2026-03-21 19:16:22');

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`) VALUES
(1, 3, 2, 5),
(2, 6, 2, 4),
(3, 6, 3, 5);

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `image` varchar(255) NOT NULL,
  `stock` int NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id`, `name`, `image`, `stock`, `status`) VALUES
(2, 'Lait', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPuqKkCTvoWbF761IIqyx1nR1UctjhnFT1UQ&s', 0, 'unavailable'),
(3, 'Huile', 'https://img-3.journaldesfemmes.fr/F0HJLiOMBcVwdnm2WANe4avjvFw=/1500x/smart/9cb902782d5241798c35bcce56169cae/ccmcms-jdf/15758620.jpg', 7, 'available'),
(4, 'Sel', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGBescB8J9Ab9dYq1Jay1iYAwkYJh3pTX0og&s', 1, 'available'),
(7, 'Farine', 'https://static.vecteezy.com/system/resources/previews/005/882/668/non_2x/whole-grain-wheat-flour-photo.jpg', 18, 'available'),
(8, 'oeufs', 'https://oterroirs.fr/cdn/shop/products/peufs-frais-bio.png?v=1664126185&width=640', 20, 'available'),
(10, 'semoule', '', 14, 'available');

-- --------------------------------------------------------

--
-- Structure de la table `stock_history`
--

DROP TABLE IF EXISTS `stock_history`;
CREATE TABLE IF NOT EXISTS `stock_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `quantity_used` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `stock_history`
--

INSERT INTO `stock_history` (`id`, `product_id`, `quantity_used`, `created_at`) VALUES
(1, 3, 3, '2026-03-21 17:43:20'),
(2, 2, 2, '2026-04-02 12:57:46'),
(3, 2, 1, '2026-04-02 12:58:13'),
(4, 5, 2, '2026-04-02 13:01:59'),
(5, 2, 2, '2026-04-02 13:01:59'),
(6, 5, 2, '2026-04-02 13:12:19'),
(7, 2, 4, '2026-04-02 13:57:23'),
(8, 3, 2, '2026-04-03 08:49:45'),
(9, 7, 2, '2026-04-03 09:18:11'),
(10, 3, 2, '2026-04-03 09:18:11'),
(11, 10, 11, '2026-04-03 13:12:15');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
