-- =====================================================
-- Student Attendance Management System Database Schema
-- Database: attendancesys
-- MySQL Version: 5.7+
-- =====================================================

-- Create database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS attendancesys;
-- USE attendancesys;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admins;

-- =====================================================
-- Table: admins
-- Description: Store admin user information
-- =====================================================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: students
-- Description: Store student information and attendance percentage
-- =====================================================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(200) DEFAULT NULL,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_roll_no (roll_no),
    INDEX idx_email (email),
    INDEX idx_attendance (attendance_percentage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: attendance_records
-- Description: Store monthly attendance records for students
-- =====================================================
CREATE TABLE attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    month VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
    working_days INT NOT NULL CHECK (working_days > 0),
    present_days INT NOT NULL CHECK (present_days >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_month (student_id, month),
    INDEX idx_student_id (student_id),
    INDEX idx_month (month),
    INDEX idx_student_month (student_id, month),
    
    CONSTRAINT chk_present_days CHECK (present_days <= working_days)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Function: Calculate attendance percentage for a student
-- =====================================================
DELIMITER //
CREATE FUNCTION calculate_attendance_percentage(student_id_param INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
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
END//
DELIMITER ;

-- =====================================================
-- Procedure: Update attendance percentage for a student
-- =====================================================
DELIMITER //
CREATE PROCEDURE update_student_attendance_percentage(IN student_id_param INT)
BEGIN
    DECLARE new_percentage DECIMAL(5,2);
    
    SET new_percentage = calculate_attendance_percentage(student_id_param);
    
    UPDATE students 
    SET attendance_percentage = new_percentage,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = student_id_param;
END//
DELIMITER ;

-- =====================================================
-- Procedure: Update all students' attendance percentages
-- =====================================================
DELIMITER //
CREATE PROCEDURE update_all_attendance_percentages()
BEGIN
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
END//
DELIMITER ;

-- =====================================================
-- Trigger: Auto-update attendance percentage after INSERT
-- =====================================================
DELIMITER //
CREATE TRIGGER tr_attendance_insert
    AFTER INSERT ON attendance_records
    FOR EACH ROW
BEGIN
    CALL update_student_attendance_percentage(NEW.student_id);
END//
DELIMITER ;

-- =====================================================
-- Trigger: Auto-update attendance percentage after UPDATE
-- =====================================================
DELIMITER //
CREATE TRIGGER tr_attendance_update
    AFTER UPDATE ON attendance_records
    FOR EACH ROW
BEGIN
    CALL update_student_attendance_percentage(NEW.student_id);
    
    -- If student_id changed, update old student too
    IF OLD.student_id != NEW.student_id THEN
        CALL update_student_attendance_percentage(OLD.student_id);
    END IF;
END//
DELIMITER ;

-- =====================================================
-- Trigger: Auto-update attendance percentage after DELETE
-- =====================================================
DELIMITER //
CREATE TRIGGER tr_attendance_delete
    AFTER DELETE ON attendance_records
    FOR EACH ROW
BEGIN
    CALL update_student_attendance_percentage(OLD.student_id);
END//
DELIMITER ;

-- =====================================================
-- Insert Default Admin User
-- Username: admin
-- Password: admin123 (properly hashed with bcrypt)
-- =====================================================
INSERT INTO admins (username, email, full_name, password_hash) VALUES
('admin', 'admin@school.edu', 'System Administrator', '$2b$10$K7L/8Y3.iWej6RQ4ObDot.Q3UBuHnqIqaFQtOjqS8qHZ6uyF4PFyO'),
('Dasu Dasari', 'dasu.cse@aknu.edu.in', 'System Administrator', '$2b$10$bu24ky68SWmXmkG9zkfiNOxDHkyqwvmUwT1lv5afsUmLBfCbZBQSC');

-- =====================================================
-- Insert Sample Students
-- Password for all: student123 (properly hashed with bcrypt)
-- =====================================================
INSERT INTO students (name, roll_no, email, password_hash) VALUES
('Chodapalli Manohar', '248865100009', 'manoharch@gmail.com', '$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrU
AgNdjGlay'),
('Devu Vasanth Kumar', '248865100011', 'vasanthkumar@gmail.com', '$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrU
AgNdjGlay'),
('Karri Jagadhesh', '248865100022', 'karrijagadhesh@gmail.com', '$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrU
AgNdjGlay'),
('P S V V Shekar', '248865100043', 'suryabhai@gmail.com', '$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrU
AgNdjGlay')
('TAMANARA SATYA SAI ', '248865100051', 'tamanarasatyasai@gmail.com', '
$2b$10$9.C/OIVry5RNcd5PlfNSGuXWN5e5n6m9.Rxw.AAJiXCgvIVJ4JYCG');

-- =====================================================
-- Insert Sample Attendance Records
-- =====================================================
INSERT INTO attendance_records (student_id, month, working_days, present_days) VALUES
-- January 2025
(1, '2025-01', 22, 20),
(2, '2025-01', 22, 18),
(3, '2025-01', 22, 21),
(4, '2025-01', 22, 16),
(5, '2025-01', 22, 19),

-- February 2025
(1, '2025-02', 20, 18),
(2, '2025-02', 20, 17),
(3, '2025-02', 20, 19),
(4, '2025-02', 20, 15),
(5, '2025-02', 20, 18),

-- March 2025
(1, '2025-03', 23, 21),
(2, '2025-03', 23, 19),
(3, '2025-03', 23, 22),
(4, '2025-03', 23, 17),
(5, '2025-03', 23, 20),

-- April 2025
(1, '2025-04', 21, 19),
(2, '2025-04', 21, 16),
(3, '2025-04', 21, 20),
(4, '2025-04', 21, 14),
(5, '2025-04', 21, 18),

-- May 2025
(1, '2025-05', 22, 20),
(2, '2025-05', 22, 18),
(3, '2025-05', 22, 21),
(4, '2025-05', 22, 16),
(5, '2025-05', 22, 19);

-- =====================================================
-- Update all attendance percentages after inserting sample data
-- =====================================================
CALL update_all_attendance_percentages();

-- =====================================================
-- Create Views for Easy Data Access
-- =====================================================

-- View: Student attendance summary
CREATE VIEW student_attendance_summary AS
SELECT 
    s.id,
    s.name,
    s.roll_no,
    s.email,
    s.attendance_percentage,
    COUNT(ar.id) as total_months,
    COALESCE(SUM(ar.working_days), 0) as total_working_days,
    COALESCE(SUM(ar.present_days), 0) as total_present_days,
    COALESCE(SUM(ar.working_days - ar.present_days), 0) as total_absent_days
FROM students s
LEFT JOIN attendance_records ar ON s.id = ar.student_id
GROUP BY s.id, s.name, s.roll_no, s.email, s.attendance_percentage;

-- View: Monthly attendance report
CREATE VIEW monthly_attendance_report AS
SELECT 
    ar.month,
    COUNT(DISTINCT ar.student_id) as total_students,
    AVG(ar.working_days) as avg_working_days,
    AVG(ar.present_days) as avg_present_days,
    AVG((ar.present_days / ar.working_days) * 100) as avg_attendance_percentage,
    COUNT(CASE WHEN (ar.present_days / ar.working_days) * 100 < 75 THEN 1 END) as low_attendance_count
FROM attendance_records ar
GROUP BY ar.month
ORDER BY ar.month DESC;

-- View: Low attendance students (below 75%)
CREATE VIEW low_attendance_students AS
SELECT 
    s.id,
    s.name,
    s.roll_no,
    s.email,
    s.attendance_percentage,
    s.created_at
FROM students s
WHERE s.attendance_percentage < 75.00
ORDER BY s.attendance_percentage ASC;

-- =====================================================
-- Database Setup Complete
-- =====================================================

SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as admin_count FROM admins;
SELECT COUNT(*) as student_count FROM students;
SELECT COUNT(*) as attendance_records_count FROM attendance_records;