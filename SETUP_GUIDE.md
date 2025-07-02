# 🚀 Student Attendance Management System - Setup Guide

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ **XAMPP** installed on your computer
- ✅ **Node.js** (version 16 or higher)
- ✅ **npm** (comes with Node.js)

## 🔧 Step-by-Step Setup Instructions

### Step 1: Start XAMPP Services

1. **Open XAMPP Control Panel**
2. **Start Apache** (click "Start" button)
3. **Start MySQL** (click "Start" button)
4. Wait until both services show "Running" status

### Step 2: Create Database

1. **Open phpMyAdmin**
   - Go to: `http://localhost/phpmyadmin`
   - Or click "Admin" button next to MySQL in XAMPP

2. **Create Database**
   - Click "New" in the left sidebar
   - Enter database name: `attendancesys`
   - Click "Create" button

3. **Import Database Schema**
   - Select the `attendancesys` database from left sidebar
   - Click "Import" tab at the top
   - Click "Choose File" and select `database/schema.sql`
   - Click "Go" button to import
   - Wait for "Import has been successfully finished" message

### Step 3: Configure Environment

The `.env` file has been created automatically with the following settings:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=attendancesys
DB_PORT=3306
JWT_SECRET=attendance_system_secret_key_2024
PORT=3001
```

**If your XAMPP MySQL has a password:**
- Edit the `.env` file
- Change `DB_PASSWORD=` to `DB_PASSWORD=your_mysql_password`

### Step 4: Install Dependencies

Open **Command Prompt** or **Terminal** in the project folder and run:

```bash
# Install all required packages
npm install
```

This will install all dependencies including:
- React frontend packages
- Express backend packages
- MySQL database connector
- File upload handlers
- Authentication libraries

### Step 5: Start the Application

Run both frontend and backend:

```bash
# Start the backend server (in one terminal)
npm run server

# Start the frontend development server (in another terminal)
npm run dev
```

**Alternative: Start both at once**
```bash
# Install concurrently if not already installed
npm install -g concurrently

# Start both frontend and backend together
npx concurrently "npm run server" "npm run dev"
```

### Step 6: Access the Application

1. **Frontend (React App):** `http://localhost:5173`
2. **Backend API:** `http://localhost:3001`
3. **phpMyAdmin:** `http://localhost/phpmyadmin`

## 🔐 Default Login Credentials

### Admin Login
- **Username:** `admin`
- **Password:** `admin123`

### Student Logins (5 test accounts)
- **Roll No:** `ST001` | **Password:** `student123`
- **Roll No:** `ST002` | **Password:** `student123`
- **Roll No:** `ST003` | **Password:** `student123`
- **Roll No:** `ST004` | **Password:** `student123`
- **Roll No:** `ST005` | **Password:** `student123`

## 🎯 Testing the System

### 1. Admin Functions
1. Login as admin
2. View dashboard with statistics
3. Add new students
4. Upload attendance CSV/Excel files
5. Manage student records

### 2. Student Functions
1. Login with student credentials
2. View personal attendance dashboard
3. Check attendance charts and statistics
4. Update profile information

### 3. File Upload Testing
Use the sample CSV format:
```csv
Roll No,Working Days,Present Days
ST001,22,20
ST002,22,18
ST003,22,21
```

## 🛠️ Troubleshooting

### Database Connection Issues

**Problem:** "Database connection failed"
**Solutions:**
1. Ensure XAMPP MySQL is running
2. Check if database `attendancesys` exists
3. Verify `.env` file credentials
4. Try restarting XAMPP services

### Port Already in Use

**Problem:** "Port 3001 already in use"
**Solution:**
```bash
# Kill process using port 3001
npx kill-port 3001

# Or change port in .env file
PORT=3002
```

### Frontend Not Loading

**Problem:** React app not starting
**Solutions:**
1. Check if port 5173 is available
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### File Upload Issues

**Problem:** CSV/Excel upload failing
**Solutions:**
1. Check file format matches template
2. Ensure file size is under 5MB
3. Verify student roll numbers exist in database

## 📁 Project Structure

```
attendance-system/
├── .env                    # Environment configuration
├── package.json           # Dependencies and scripts
├── database/
│   ├── schema.sql         # Database structure
│   └── README.md          # Database setup guide
├── server/
│   ├── index.js           # Backend API server
│   ├── database.js        # Database connection
│   └── uploads/           # Uploaded files storage
├── src/                   # React frontend
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   └── main.tsx          # App entry point
└── public/               # Static assets
```

## 🔄 Development Workflow

### Making Changes
1. **Frontend changes:** Edit files in `src/` folder
2. **Backend changes:** Edit files in `server/` folder
3. **Database changes:** Update `database/schema.sql`

### Adding New Students
1. Login as admin
2. Go to "Manage Students"
3. Click "Add Student"
4. Fill in details and submit

### Uploading Attendance
1. Login as admin
2. Go to "Upload Attendance"
3. Select month and CSV/Excel file
4. Click "Upload Attendance"

## 📊 Database Management

### Viewing Data
- **phpMyAdmin:** `http://localhost/phpmyadmin`
- **Tables:** students, admins, attendance_records
- **Views:** student_attendance_summary, monthly_attendance_report

### Backup Database
```bash
mysqldump -u root -p attendancesys > backup.sql
```

### Restore Database
```bash
mysql -u root -p attendancesys < backup.sql
```

## 🚀 Production Deployment

For production deployment:
1. Change JWT_SECRET to a strong random key
2. Set proper database credentials
3. Configure CORS for your domain
4. Use environment-specific .env files
5. Set up proper SSL certificates

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure XAMPP services are running
4. Check console logs for error messages

---

**🎉 You're all set! The Student Attendance Management System should now be running successfully.**