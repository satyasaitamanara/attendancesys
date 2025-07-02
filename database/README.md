# Database Setup Instructions

## Prerequisites
- XAMPP installed and running
- MySQL service started in XAMPP

## Setup Steps

### 1. Create Database
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Click "New" to create a new database
3. Enter database name: `attendancesys`
4. Click "Create"

### 2. Import Schema
1. Select the `attendancesys` database
2. Click on "Import" tab
3. Choose the `schema.sql` file from this directory
4. Click "Go" to execute

**OR**

### Alternative: Command Line Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE attendancesys;

# Exit MySQL
exit

# Import schema
mysql -u root -p attendancesys < database/schema.sql
```

## Default Credentials

### Admin Login
- **Username:** admin
- **Password:** admin123

### Student Logins
- **Roll No:** ST001, **Password:** student123
- **Roll No:** ST002, **Password:** student123
- **Roll No:** ST003, **Password:** student123
- **Roll No:** ST004, **Password:** student123
- **Roll No:** ST005, **Password:** student123

## Database Structure

### Tables
1. **admins** - Admin user accounts
2. **students** - Student accounts and attendance percentages
3. **attendance_records** - Monthly attendance data

### Key Features
- Automatic attendance percentage calculation
- Triggers to update percentages when records change
- Sample data for testing
- Useful views for reporting

### Views
1. **student_attendance_summary** - Complete student attendance overview
2. **monthly_attendance_report** - Monthly statistics
3. **low_attendance_students** - Students below 75% attendance

## Environment Configuration

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=attendancesys
DB_PORT=3306
JWT_SECRET=your-jwt-secret-key-here
PORT=3001
```

## Verification

After setup, you can verify the installation by running these queries in phpMyAdmin:

```sql
-- Check if all tables exist
SHOW TABLES;

-- Check sample data
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM attendance_records;
SELECT * FROM student_attendance_summary;
```

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Ensure XAMPP MySQL is running
   - Check database credentials in `.env`

2. **Import Errors**
   - Make sure database `attendancesys` exists before importing
   - Check MySQL version compatibility

3. **Permission Issues**
   - Ensure MySQL user has proper privileges
   - Try running as administrator

### Reset Database
To completely reset the database:

```sql
DROP DATABASE IF EXISTS attendancesys;
CREATE DATABASE attendancesys;
USE attendancesys;
-- Then re-import schema.sql
```