-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 01, 2025 at 04:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `attendancesys`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_all_attendance_percentages` ()   BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE student_id_var INT;
    DECLARE student_cursor CURSOR FOR SELECT id FROM students;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN student_cursor;
    
    read_loop: LOOP
        FETCH student_cursor INTO student_id_var;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL update_student_attendance_percentage(student_id_var);
    END LOOP;
    
    CLOSE student_cursor;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_student_attendance_percentage` (IN `student_id_param` INT)   BEGIN
    DECLARE new_percentage DECIMAL(5,2);
    
    SET new_percentage = calculate_attendance_percentage(student_id_param);
    
    UPDATE students 
    SET attendance_percentage = new_percentage,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = student_id_param;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `calculate_attendance_percentage` (`student_id_param` INT) RETURNS DECIMAL(5,2) DETERMINISTIC READS SQL DATA BEGIN
    DECLARE total_working_days INT DEFAULT 0;
    DECLARE total_present_days INT DEFAULT 0;
    DECLARE percentage DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT 
        COALESCE(SUM(working_days), 0),
        COALESCE(SUM(present_days), 0)
    INTO total_working_days, total_present_days
    FROM attendance_records
    WHERE student_id = student_id_param;
    
    IF total_working_days > 0 THEN
        SET percentage = ROUND((total_present_days / total_working_days) * 100, 2);
    END IF;
    
    RETURN percentage;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `full_name`, `password_hash`, `created_at`, `updated_at`) VALUES
(2, 'Dasu Dasari', 'dasu.cse@aknu.edu.in', 'System Administrator', '$2b$10$bu24ky68SWmXmkG9zkfiNOxDHkyqwvmUwT1lv5afsUmLBfCbZBQSC', '2025-06-29 16:50:20', '2025-06-30 12:44:46');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `month` varchar(7) NOT NULL COMMENT 'Format: YYYY-MM',
  `working_days` int(11) NOT NULL CHECK (`working_days` > 0),
  `present_days` int(11) NOT NULL CHECK (`present_days` >= 0),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `student_id`, `month`, `working_days`, `present_days`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-01', 22, 20, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(2, 2, '2025-01', 22, 18, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(3, 3, '2025-01', 22, 21, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(4, 4, '2025-01', 22, 16, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(5, 5, '2025-01', 22, 19, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(6, 1, '2025-02', 20, 18, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(7, 2, '2025-02', 20, 17, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(8, 3, '2025-02', 20, 19, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(9, 4, '2025-02', 20, 15, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(10, 5, '2025-02', 20, 18, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(11, 1, '2025-03', 23, 21, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(12, 2, '2025-03', 23, 19, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(13, 3, '2025-03', 23, 22, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(14, 4, '2025-03', 23, 17, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(15, 5, '2025-03', 23, 20, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(16, 1, '2025-04', 21, 19, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(17, 2, '2025-04', 21, 16, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(18, 3, '2025-04', 21, 20, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(19, 4, '2025-04', 21, 14, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(20, 5, '2025-04', 21, 18, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(21, 1, '2025-05', 22, 20, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(22, 2, '2025-05', 22, 18, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(23, 3, '2025-05', 22, 21, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(24, 4, '2025-05', 22, 16, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(25, 5, '2025-05', 22, 19, '2025-06-29 16:50:20', '2025-06-29 16:50:20');

--
-- Triggers `attendance_records`
--
DELIMITER $$
CREATE TRIGGER `tr_attendance_delete` AFTER DELETE ON `attendance_records` FOR EACH ROW BEGIN
    CALL update_student_attendance_percentage(OLD.student_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_attendance_insert` AFTER INSERT ON `attendance_records` FOR EACH ROW BEGIN
    CALL update_student_attendance_percentage(NEW.student_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_attendance_update` AFTER UPDATE ON `attendance_records` FOR EACH ROW BEGIN
    CALL update_student_attendance_percentage(NEW.student_id);
    
    -- If student_id changed, update old student too
    IF OLD.student_id != NEW.student_id THEN
        CALL update_student_attendance_percentage(OLD.student_id);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `low_attendance_students`
-- (See below for the actual view)
--
CREATE TABLE `low_attendance_students` (
`id` int(11)
,`name` varchar(100)
,`roll_no` varchar(50)
,`email` varchar(100)
,`attendance_percentage` decimal(5,2)
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `monthly_attendance_report`
-- (See below for the actual view)
--
CREATE TABLE `monthly_attendance_report` (
`month` varchar(7)
,`total_students` bigint(21)
,`avg_working_days` decimal(14,4)
,`avg_present_days` decimal(14,4)
,`avg_attendance_percentage` decimal(21,8)
,`low_attendance_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `roll_no` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_image` varchar(200) DEFAULT NULL,
  `attendance_percentage` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `roll_no`, `email`, `password_hash`, `profile_image`, `attendance_percentage`, `created_at`, `updated_at`) VALUES
(1, 'John Doe', 'ST001', 'john.doe@student.edu', '$2b$10$PBeDWjDA9hLpWG4FnPIQq.bGKiSu3pczgo1aTFW8V0Tiub3ooVH9q', NULL, 90.74, '2025-06-29 16:50:20', '2025-06-30 14:16:33'),
(2, 'Jane Smith', 'ST002', 'jane.smith@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 81.48, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(3, 'Mike Johnson', 'ST003', 'mike.johnson@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 95.37, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(4, 'Sarah Wilson', 'ST004', 'sarah.wilson@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 72.22, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(5, 'David Brown', 'ST005', 'david.brown@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 87.04, '2025-06-29 16:50:20', '2025-06-29 16:50:20'),
(6, 'TAMANARA SATYA SAI ', '248865100051', 'tamanarasatyasai@gmail.com', '$2b$10$9.C/OIVry5RNcd5PlfNSGuXWN5e5n6m9.Rxw.AAJiXCgvIVJ4JYCG', NULL, 0.00, '2025-06-30 14:03:15', '2025-06-30 14:03:15'),
(7, 'Chodapalli Manohar', '248865100009', 'manoharch@gmail.com',
'$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrUAgNdjGlay', NULL, 0.00, '2025-06-30 14:03:15', '2025-06-30 14:03:15');

-- --------------------------------------------------------

--
-- Stand-in structure for view `student_attendance_summary`
-- (See below for the actual view)
--
CREATE TABLE `student_attendance_summary` (
`id` int(11)
,`name` varchar(100)
,`roll_no` varchar(50)
,`email` varchar(100)
,`attendance_percentage` decimal(5,2)
,`total_months` bigint(21)
,`total_working_days` decimal(32,0)
,`total_present_days` decimal(32,0)
,`total_absent_days` decimal(33,0)
);

-- --------------------------------------------------------

--
-- Structure for view `low_attendance_students`
--
DROP TABLE IF EXISTS `low_attendance_students`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `low_attendance_students`  AS SELECT `s`.`id` AS `id`, `s`.`name` AS `name`, `s`.`roll_no` AS `roll_no`, `s`.`email` AS `email`, `s`.`attendance_percentage` AS `attendance_percentage`, `s`.`created_at` AS `created_at` FROM `students` AS `s` WHERE `s`.`attendance_percentage` < 75.00 ORDER BY `s`.`attendance_percentage` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `monthly_attendance_report`
--
DROP TABLE IF EXISTS `monthly_attendance_report`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `monthly_attendance_report`  AS SELECT `ar`.`month` AS `month`, count(distinct `ar`.`student_id`) AS `total_students`, avg(`ar`.`working_days`) AS `avg_working_days`, avg(`ar`.`present_days`) AS `avg_present_days`, avg(`ar`.`present_days` / `ar`.`working_days` * 100) AS `avg_attendance_percentage`, count(case when `ar`.`present_days` / `ar`.`working_days` * 100 < 75 then 1 end) AS `low_attendance_count` FROM `attendance_records` AS `ar` GROUP BY `ar`.`month` ORDER BY `ar`.`month` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `student_attendance_summary`
--
DROP TABLE IF EXISTS `student_attendance_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `student_attendance_summary`  AS SELECT `s`.`id` AS `id`, `s`.`name` AS `name`, `s`.`roll_no` AS `roll_no`, `s`.`email` AS `email`, `s`.`attendance_percentage` AS `attendance_percentage`, count(`ar`.`id`) AS `total_months`, coalesce(sum(`ar`.`working_days`),0) AS `total_working_days`, coalesce(sum(`ar`.`present_days`),0) AS `total_present_days`, coalesce(sum(`ar`.`working_days` - `ar`.`present_days`),0) AS `total_absent_days` FROM (`students` `s` left join `attendance_records` `ar` on(`s`.`id` = `ar`.`student_id`)) GROUP BY `s`.`id`, `s`.`name`, `s`.`roll_no`, `s`.`email`, `s`.`attendance_percentage` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_month` (`student_id`,`month`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_month` (`month`),
  ADD KEY `idx_student_month` (`student_id`,`month`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roll_no` (`roll_no`),
  ADD KEY `idx_roll_no` (`roll_no`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_attendance` (`attendance_percentage`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
