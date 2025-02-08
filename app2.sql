-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.6.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.9.0.6999
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for app
CREATE DATABASE IF NOT EXISTS `app` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `app`;

-- Dumping structure for table app.pet_owner
CREATE TABLE IF NOT EXISTS `pet_owner` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `pet_name` varchar(100) NOT NULL,
  `age_group` varchar(50) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `pick_up_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table app.pet_owner: ~1 rows (approximately)
DELETE FROM `pet_owner`;
INSERT INTO `pet_owner` (`id`, `name`, `pet_name`, `age_group`, `gender`, `category`, `phone`, `email`, `pick_up_date`, `created_at`) VALUES
	(1, 'mosaa', 'poadw', '7-12', 'Male', 'Dog', '0981238223', 'pos@gmail.com', '2025-01-10', '2025-02-08 06:08:28');

-- Dumping structure for table app.posts
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `age` varchar(50) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `adopt` enum('Dog','Cat','Dog And Cat') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table app.posts: ~1 rows (approximately)
DELETE FROM `posts`;
INSERT INTO `posts` (`id`, `name`, `age`, `gender`, `adopt`, `phone`, `price`, `image_path`, `created_at`) VALUES
	(2, 'mas', '21', 'Female', 'Dog And Cat', '0981234553', 200.00, 'uploads\\1739020467843-images (6).jpg', '2025-02-08 13:14:27');

-- Dumping structure for table app.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `subscribe` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table app.users: ~2 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `phone_number`, `gender`, `subscribe`) VALUES
	(1, 'lopsa', 'lsad', 'fis@gmail.com', '$2a$10$vdn7TsUlEKgD/Zflw2RxyO9VrJhGpvObn3FU52ZY88vJInWt0BcHi', '0981235335', 'Male', 1),
	(2, 'oasdw', 'wdasd', 'pos@gmail.com', '$2a$10$yBaSgrLqCTd8xHjKbJGcn.zotRzQKDPPI.BCkGLlJAT666BoaoLx6', '0981242442', 'Female', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
