
-- the full SQL script from the user will be substituted here at runtime for processing

-- ============================
-- Clever Cloud Compatible SQL
-- ============================

-- Drop existing tables
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admins;

-- ============================
-- Table: admins
-- ============================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================
-- Table: students
-- ============================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(200) DEFAULT NULL,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================
-- Table: attendance_records
-- ============================
CREATE TABLE attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    month VARCHAR(7) NOT NULL,
    working_days INT NOT NULL,
    present_days INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_month (student_id, month)
);

-- ============================
-- Sample Admins
-- ============================
INSERT INTO admins (username, email, full_name, password_hash) VALUES
('admin', 'admin@school.edu', 'System Administrator', '$2b$10$K7L/8Y3.iWej6RQ4ObDot.Q3UBuHnqIqaFQtOjqS8qHZ6uyF4PFyO'),
('Dasu Dasari', 'dasu.cse@aknu.edu.in', 'System Administrator', '$2b$10$bu24ky68SWmXmkG9zkfiNOxDHkyqwvmUwT1lv5afsUmLBfCbZBQSC');

-- ============================
-- Sample Students
-- ============================
INSERT INTO students (name, roll_no, email, password_hash) VALUES
('Chodapalli Manohar', '248865100009', 'manoharch@gmail.com', '$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrU
AgNdjGlay'),
('Devu Vasanth Kumar', '248865100011', 'vasanthkumar@gmail.com', '$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrU
AgNdjGlay'),
('Karri Jagadhesh', '248865100022', 'karrijagadhesh@gmail.com', '$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrU
AgNdjGlay'),
('P S V V Shekhar', '248865100043', 'suryabhai@gmail.com', '$2b$10$/2z5.KPp8BWYOxpO5Drjo.LrcR.qeOBMogRzoYRjgQrU
AgNdjGlay'),
('TAMANARA SATYA SAI', '248865100051', 'tamanarasatyasai@gmail.com', '$2b$10$9.C/OIVry5RNcd5PlfNSGuXWN5e5n6m9.Rxw.AAJiXCgvIVJ4JYCG');

-- ============================
-- Sample Attendance Records
-- ============================
INSERT INTO attendance_records (student_id, month, working_days, present_days) VALUES
(1, '2025-01', 22, 20),
(2, '2025-01', 22, 18),
(3, '2025-01', 22, 21),
(4, '2025-01', 22, 16),
(5, '2025-01', 22, 19);

-- ============================
-- Views
-- ============================
CREATE VIEW student_attendance_summary AS
SELECT 
    s.id,
    s.name,
    s.roll_no,
    s.email,
    s.attendance_percentage,
    COUNT(ar.id) AS total_months,
    COALESCE(SUM(ar.working_days), 0) AS total_working_days,
    COALESCE(SUM(ar.present_days), 0) AS total_present_days,
    COALESCE(SUM(ar.working_days - ar.present_days), 0) AS total_absent_days
FROM students s
LEFT JOIN attendance_records ar ON s.id = ar.student_id
GROUP BY s.id;

CREATE VIEW monthly_attendance_report AS
SELECT 
    month,
    COUNT(DISTINCT student_id) AS total_students,
    AVG(working_days) AS avg_working_days,
    AVG(present_days) AS avg_present_days,
    AVG((present_days / working_days) * 100) AS avg_attendance_percentage
FROM attendance_records
GROUP BY month;

CREATE VIEW low_attendance_students AS
SELECT 
    id,
    name,
    roll_no,
    email,
    attendance_percentage,
    created_at
FROM students
WHERE attendance_percentage < 75.00;

