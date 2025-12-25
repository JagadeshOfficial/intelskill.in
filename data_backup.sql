-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: auth_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_audit_logs`
--

DROP TABLE IF EXISTS `admin_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `admin_audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_logs`
--

LOCK TABLES `admin_audit_logs` WRITE;
/*!40000 ALTER TABLE `admin_audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_tokens`
--

DROP TABLE IF EXISTS `admin_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'ACCESS',
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_revoked` (`revoked`),
  CONSTRAINT `admin_tokens_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_tokens`
--

LOCK TABLES `admin_tokens` WRITE;
/*!40000 ALTER TABLE `admin_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'ADMIN',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `mobile_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_admins_mobile_number` (`mobile_number`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin@example.com','$2a$10$SaErBkK2RLOQPEzgZDIsn.fNXlZbohc6LlEYRBYyW1tQlprVTQ1YG','System','Administrator','ADMIN','ACTIVE','2025-11-15 17:26:11','2025-12-23 23:32:00','2025-12-23 23:32:00',NULL,NULL),(8,'jagadeswararaovana@gmail.com','$2a$10$kpF2WbfVY6nRs8YvN72F9.1pCpcqG0m0i2abvVobdtXLQhB.5gO1y','Jagadesh','Vana','ADMIN','ACTIVE','2025-11-16 22:14:39','2025-12-16 01:02:24','2025-12-16 01:02:24','8790055638','admin_8_aca2138a-77ef-4415-a08c-fe74a2420a1b.jpg'),(9,'intelskill.ad9014@gmail.com','$2a$10$dr765bp.zRmpKSE6PlT7NO2EkWfYJ6duPJbCS69BidFD260wTwR/i','Shaik','Jilani','ADMIN','ACTIVE','2025-12-16 01:35:39','2025-12-24 12:36:09','2025-12-24 12:36:09','+91 9876543210','admin_9_dab5aca5-6f7a-4f16-997b-df0168d3239c.jpg');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch` varchar(255) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `creator_id` varchar(255) DEFAULT NULL,
  `description` text,
  `due_date` varchar(255) DEFAULT NULL,
  `pending_reviews` int DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `total_submissions` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (1,'February 2026','Java Full Stack with GenAI','2025-12-19 04:02:03.563417',NULL,'Cmopltw it by eod','2025-12-19',0,'Archived','loops',0),(3,'February 2026','Java Full Stack with GenAI','2025-12-19 04:28:35.215284','4','complete it by today','2025-12-18',0,'Archived','while loop',0),(4,'Dec-2025','Java Full Stack with GenAI','2025-12-21 17:27:25.832667',NULL,'Complete the Assignment by the 22 Eod','2025-12-22',0,'Active','OOPS',0);
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batch_students`
--

DROP TABLE IF EXISTS `batch_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_students` (
  `batch_id` bigint NOT NULL,
  `student_id` int NOT NULL,
  PRIMARY KEY (`batch_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `batch_students_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `batch_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_students`
--

LOCK TABLES `batch_students` WRITE;
/*!40000 ALTER TABLE `batch_students` DISABLE KEYS */;
INSERT INTO `batch_students` VALUES (1,1),(2,1),(6,1),(1,4),(1,5),(2,6),(2,7),(2,11),(1,12),(1,13),(2,13),(6,13);
/*!40000 ALTER TABLE `batch_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_batch_name` (`course_id`,`name`),
  CONSTRAINT `FKtbawjftiqaevewxyn60x9hveh` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (1,'January 2025',1,'2025-11-26 08:59:18.656174','2025-11-26 08:59:18.656174'),(2,'February 2026',1,'2025-11-26 08:59:18.656174','2025-12-18 11:10:50.426437'),(4,'Manual Batch',1,'2025-12-18 11:30:10.000000','2025-12-18 11:30:10.243459'),(5,'March 2026',3,'2025-12-18 11:45:54.993254','2025-12-18 11:45:54.993254'),(6,'Dec-2025',1,'2025-12-21 22:46:20.785881','2025-12-21 22:46:20.785881');
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'Java Full Stack with GenAI','Learn the fundamentals of Full Stack Developer.'),(3,'Python with Data Anaytics','Core Python');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `folders`
--

DROP TABLE IF EXISTS `folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `batch_id` (`batch_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `folders_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`),
  CONSTRAINT `folders_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `folders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `folders`
--

LOCK TABLES `folders` WRITE;
/*!40000 ALTER TABLE `folders` DISABLE KEYS */;
INSERT INTO `folders` VALUES (1,2,'Core Java',NULL,'2025-12-05 09:01:40'),(2,2,'Advance Java',NULL,'2025-12-05 09:12:48'),(6,1,'JFS-Feb',NULL,'2025-12-14 22:45:14'),(8,2,'Advance Java',1,'2025-12-16 01:41:51'),(9,6,'Core Java',NULL,'2025-12-21 11:51:54');
/*!40000 ALTER TABLE `folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `tutor_id` int DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2025-11-19 06:22:45.656987',_binary '','New tutor registration: Jagadeswararao Vana','ACCEPTED',1,'TUTOR_REGISTER'),(2,'2025-11-19 10:43:42.093937',_binary '','New tutor registration: Anuradha Arnipalli','ACCEPTED',2,'TUTOR_REGISTER'),(3,'2025-12-16 07:08:20.861714',_binary '','New tutor registration: Venkataramana Venkataramana','ACCEPTED',3,'TUTOR_REGISTER'),(4,'2025-12-16 08:11:18.039462',_binary '','New tutor registration: Jilani Shaik','ACCEPTED',4,'TUTOR_REGISTER');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_storage`
--

DROP TABLE IF EXISTS `otp_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_storage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attempts` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `otp` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_nbui5txp4c24otiil1t2kd9e2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_storage`
--

LOCK TABLES `otp_storage` WRITE;
/*!40000 ALTER TABLE `otp_storage` DISABLE KEYS */;
INSERT INTO `otp_storage` VALUES (1,0,'2025-11-18 14:56:15.630765','jagadeswararaovana@gmail.com','2025-12-16 07:45:25.781564','619658'),(3,0,'2025-11-19 13:20:57.213173','jagadeshbytecodetrainings@gmail.com','2025-11-19 13:25:57.213173','684626');
/*!40000 ALTER TABLE `otp_storage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `meeting_link` varchar(255) DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `batch_id` bigint DEFAULT NULL,
  `course_id` bigint DEFAULT NULL,
  `tutor_id` int DEFAULT NULL,
  `session_link` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2gms9cmg2lju89746kbb6m33k` (`batch_id`),
  KEY `FK6vg2up0ceoei51c9ggw281iq4` (`course_id`),
  KEY `FK4dn7sgm484jxdsenap374wu7l` (`tutor_id`),
  CONSTRAINT `FK2gms9cmg2lju89746kbb6m33k` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`),
  CONSTRAINT `FK4dn7sgm484jxdsenap374wu7l` FOREIGN KEY (`tutor_id`) REFERENCES `tutors` (`id`),
  CONSTRAINT `FK6vg2up0ceoei51c9ggw281iq4` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `verified` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_e2rndfrsx22acpq2ty1caeuyw` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'2025-11-19 14:11:33.788683','jagadeshvanaoffical@gmail.com','Jaga','2025-12-24 06:53:44.214330','Vana','$2a$10$bxoe.R7bYPoHovy75rT/a.2OLAqSUgTjFhSH0wuA6WFtG24ghID1m','8790055638','admin_1_fda0fba0-4556-44a4-b712-8ac0fc316432.png','APPROVED','2025-12-24 06:53:44.214330',_binary ''),(4,'2025-11-26 08:28:06.000000','bob.wilson@example.com','Bob',NULL,'Wilson','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(5,'2025-11-26 08:28:06.000000','charlie.brown@example.com','Charlie',NULL,'Brown','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(6,'2025-11-26 08:28:06.000000','diana.smith@example.com','Diana',NULL,'Smith','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(7,'2025-11-26 08:28:06.000000','ethan.davis@example.com','Ethan',NULL,'Davis','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(8,'2025-11-26 08:28:06.000000','fiona.garcia@example.com','Fiona',NULL,'Garcia','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(9,'2025-11-26 08:28:06.000000','george.martinez@example.com','George',NULL,'Martinez','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(10,'2025-11-26 08:28:06.000000','hannah.lee@example.com','Hannah',NULL,'Lee','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(11,'2025-11-26 08:28:06.000000','ian.clark@example.com','Ian',NULL,'Clark','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(12,'2025-11-26 08:28:06.000000','julia.rodriguez@example.com','Julia',NULL,'Rodriguez','$2y$10$dummyhash1234567890',NULL,NULL,'active','2025-11-26 08:28:06.000000',_binary ''),(13,'2025-12-16 08:16:32.276954','intelskill.stud9014@gmail.com','Jagadesh','2025-12-24 14:11:10.434675','Vana','$2a$10$NJLRBi7wvz5G61UFAqDbK.tN107b0LJG5WuNSyKUKLB5YYO.QeeTC','9876543210','admin_13_b0f3ff18-e937-4330-995e-fb0fa69d7f38.png','APPROVED','2025-12-24 14:11:10.434675',_binary '');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch` varchar(255) DEFAULT NULL,
  `content` text,
  `course` varchar(255) DEFAULT NULL,
  `feedback` text,
  `grade` int DEFAULT NULL,
  `item_id` varchar(255) DEFAULT NULL,
  `item_title` varchar(255) DEFAULT NULL,
  `item_type` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `student_email` varchar(255) DEFAULT NULL,
  `student_id` varchar(255) DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,'February 2026','https://github.com/JagadeshOfficial/Practice_Question.git','Java Full Stack with GenAI','Good',75,'1','loops','Assignment','Graded','intelskill.stud9014@gmail.com',NULL,'Jagadesh Vana','2025-12-19 04:04:21.632367'),(2,'February 2026','https://github.com/JagadeshOfficial/Practice_Question/tree/master/JavaPrograms','Java Full Stack with GenAI','good',80,'2','for loop','Assignment','Graded','intelskill.stud9014@gmail.com',NULL,'Jagadesh Vana','2025-12-19 04:21:45.893387'),(3,'Dec-2025','https://github.com/JagadeshOfficial/Practice_Question.git','Java Full Stack with GenAI','Keep it Up and Good',75,'4','OOPS','Assignment','Graded','intelskill.stud9014@gmail.com',NULL,'Jagadesh Vana','2025-12-21 17:30:27.332441');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tests`
--

DROP TABLE IF EXISTS `tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempts` int DEFAULT NULL,
  `avg_score` double DEFAULT NULL,
  `batch` varchar(255) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `creator_id` varchar(255) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `pass_score` int DEFAULT NULL,
  `questions_count` int DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tests`
--

LOCK TABLES `tests` WRITE;
/*!40000 ALTER TABLE `tests` DISABLE KEYS */;
INSERT INTO `tests` VALUES (1,0,0,NULL,NULL,'2025-12-19 06:17:35.909077',NULL,60,NULL,NULL,'Active','For Loop');
/*!40000 ALTER TABLE `tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_applications`
--

DROP TABLE IF EXISTS `tutor_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_applications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `expertise` varchar(1000) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `resume_url` varchar(255) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `why_join` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_applications`
--

LOCK TABLES `tutor_applications` WRITE;
/*!40000 ALTER TABLE `tutor_applications` DISABLE KEYS */;
INSERT INTO `tutor_applications` VALUES (1,'2025-12-18 08:20:14.811906','venkygokurla@gmail.com','6','Java Full Stack','Venkataramana','Venkataramana','+916281140319','https://www.linkedin.com/in/venkataramana21/','https://firebasestorage.googleapis.com/v0/b/learnflow-storage.firebasestorage.app/o/resumes%2F1766046003819_GOKURLA_VENKATARAMANA_CSE_2025.pdf?alt=media&token=6dd458a4-f5c7-403d-b229-7d645c493c61','PENDING','Complete your profile details\n2\nShare your professional experience\n3\nBriefly describe your course idea\n4\nOur team reviews your application within 48h'),(2,'2025-12-18 08:36:35.795710','venkygokurla@gmail.com','6','Java Full Stack','Venkataramana','Venkataramana','+916281140319','https://www.linkedin.com/in/venkataramana21/','https://firebasestorage.googleapis.com/v0/b/learnflow-storage.firebasestorage.app/o/resumes%2F1766046987438_GOKURLA_VENKATARAMANA_CSE_2025.pdf?alt=media&token=d8bf16b6-de49-4ede-8bdd-f7f0f5dee9a5','PENDING','Complete your profile details\n2\nShare your professional experience\n3\nBriefly describe your course idea\n4\nOur team reviews your application within 48h'),(3,'2025-12-18 12:15:26.917000','venkygokurla@gmail.com','6','Java Full Stack','Venkataramana','Venkataramana','+916281140319','https://www.linkedin.com/in/venkataramana21/','https://firebasestorage.googleapis.com/v0/b/learnflow-storage.firebasestorage.app/o/resumes%2F1766060124032_S.CharanTeja_JavaFullStack_2025.docx?alt=media&token=48082e5a-0b0f-4711-b792-4fdca563faee','PENDING','Contact our support team for any questions regarding the application process.'),(4,'2025-12-18 12:21:03.087930','jagadeswararaovana@gmail.com','7','Java Full Stack','Venkataramana','Venkataramana','+916281140319','https://www.linkedin.com/in/venkataramana21/','https://firebasestorage.googleapis.com/v0/b/learnflow-storage.firebasestorage.app/o/resumes%2F1766060454307_GOKURLA_VENKATARAMANA_CSE_2025.pdf?alt=media&token=c15f7305-4100-49c9-91a7-726e91d4c4d8','PENDING','Share your professional experience\n3\nBriefly describe your course idea\n4\nOur team reviews your application within 48h'),(5,'2025-12-18 12:27:45.561489','jagadeswararaovana@gmail.com','7','Java Full Stack','Venkataramana','Venkataramana','+916281140319','https://www.linkedin.com/in/venkataramana21/','https://firebasestorage.googleapis.com/v0/b/learnflow-storage.firebasestorage.app/o/resumes%2F1766060857940_GOKURLA_VENKATARAMANA_CSE%20(1).pdf?alt=media&token=46a94d76-1710-4fb5-9f16-f5a44c7e6201','APPROVED','Complete your profile details\n2\nShare your professional experience\n3\nBriefly describe your course idea\n4\nOur team reviews your application within 48h'),(6,'2025-12-21 17:58:58.179068','jagadeswararaovana@gmail.com','7','Java Full Stack','Jagadeswarara','Vana','8790055638','https://www.linkedin.com/in/jagadeswararao-vana-4b1863268/','https://firebasestorage.googleapis.com/v0/b/learnflow-storage.firebasestorage.app/o/resumes%2F1766339929008_GOKURLA_VENKATARAMANA_CSE_2025.pdf?alt=media&token=0d7e76e1-7e7c-4530-88b1-4d95bec5c55c','APPROVED','I am & Years of Full stack Java');
/*!40000 ALTER TABLE `tutor_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_content`
--

DROP TABLE IF EXISTS `tutor_content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_content` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tutor_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `drive_file_id` varchar(128) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `folder_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_content`
--

LOCK TABLES `tutor_content` WRITE;
/*!40000 ALTER TABLE `tutor_content` DISABLE KEYS */;
/*!40000 ALTER TABLE `tutor_content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_courses`
--

DROP TABLE IF EXISTS `tutor_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_courses` (
  `tutor_id` int NOT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`tutor_id`,`course_id`),
  KEY `FK67uj8x8f21dop08v33v901sik` (`course_id`),
  CONSTRAINT `FK4iw33pcd4xalnywuwl8fccotp` FOREIGN KEY (`tutor_id`) REFERENCES `tutors` (`id`),
  CONSTRAINT `FK67uj8x8f21dop08v33v901sik` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_courses`
--

LOCK TABLES `tutor_courses` WRITE;
/*!40000 ALTER TABLE `tutor_courses` DISABLE KEYS */;
INSERT INTO `tutor_courses` VALUES (4,1);
/*!40000 ALTER TABLE `tutor_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutors`
--

DROP TABLE IF EXISTS `tutors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bio` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `expertise` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `hourly_rate` varchar(255) DEFAULT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `verified` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_cx2524pmv5o93f0aihe1o8lgp` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutors`
--

LOCK TABLES `tutors` WRITE;
/*!40000 ALTER TABLE `tutors` DISABLE KEYS */;
INSERT INTO `tutors` VALUES (3,NULL,'2025-12-16 07:08:20.832884','venkygokurla@gmail.com',NULL,'Java Full Stack','Venkataramana',NULL,NULL,'Venkataramana','$2a$10$u4BXisgxLkUBS9tSTxIBEuiefS.ayW4w9YR4trua99g9kTZMKDxUa','06281140319',NULL,NULL,'SUSPENDED','2025-12-21 17:14:42.763242',_binary ''),(4,'Trainer','2025-12-16 08:11:17.943421','intelskill.tut9014@gmail.com','7','Java Full Stack','Jilani','3000','2025-12-24 13:02:18.838578','Shaik','$2a$10$bsUkrX8cjHaJgLpjpC/H.u8CdhTDS0TqR.ez7q3bOX6yU/EP1NCeS','+91 9876543210','admin_4_51988fb4-0d9c-4664-874b-842192499683.png','BTECH','APPROVED','2025-12-24 13:02:18.838578',_binary '');
/*!40000 ALTER TABLE `tutors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-25 21:38:04
