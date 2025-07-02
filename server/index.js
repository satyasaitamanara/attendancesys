import express from 'express';
import cors from 'cors';
import multer from 'multer';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { testConnection, getOne, getMany, insertRecord, updateRecord, executeQuery } from './database.js';

// Load environment variables
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Test database connection on startup
testConnection();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sai@1933';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};


const hash = await bcrypt.hash('dasu1985', 10);
console.log('Hashed Password:', hash);

// Auth Routes
app.post('/api/auth/student/login', async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    const student = await getOne(
      'SELECT * FROM students WHERE roll_no = ?',
      [rollNo]
    );
    console.log(student);
    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

   console.log('🚀 Login attempt:', { rollNo, password });
  console.log('🔐 Fetched from DB:', student);
  console.log('🔐 Stored hash:', student.password_hash);
  const isValidPassword = await bcrypt.compare(password, student.password_hash);
  console.log('✅ Password match:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student.id, role: 'student', rollNo: student.roll_no },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: student.id,
        name: student.name,
        rollNo: student.roll_no,
        email: student.email,
        profileImage: student.profile_image,
        attendancePercentage: student.attendance_percentage,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await getOne(
      'SELECT * FROM admins WHERE username = ? ',
      [username]
    );
    console.log(admin);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials....!' });
    }

    console.log('🚀 Login attempt:', { username, password });
    console.log('🔐 Fetched from DB:', admin);
    console.log('🔐 Stored hash:', admin.password_hash);
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    console.log('✅ Password match:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials!.....' });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin', username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student Routes
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const students = await getMany(
      'SELECT id, name, roll_no, email, attendance_percentage, created_at FROM students ORDER BY roll_no'
    );

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/students', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, rollNo, email, password } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const studentId = await insertRecord(
        'INSERT INTO students (name, roll_no, email, password_hash) VALUES (?, ?, ?, ?)',
        [name, rollNo, email, passwordHash]
      );

      const student = await getOne(
        'SELECT id, name, roll_no, email, attendance_percentage FROM students WHERE id = ?',
        [studentId]
      );

      res.status(201).json({
        id: student.id,
        name: student.name,
        rollNo: student.roll_no,
        email: student.email,
        attendancePercentage: student.attendance_percentage
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Student with this roll number or email already exists' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Students can only access their own data, admins can access any
    if (req.user.role === 'student' && req.user.id != studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const student = await getOne(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      id: student.id,
      name: student.name,
      rollNo: student.roll_no,
      email: student.email,
      profileImage: student.profile_image,
      attendancePercentage: student.attendance_percentage,
      createdAt: student.created_at
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance Routes
app.get('/api/attendance/:studentId', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Students can only access their own attendance, admins can access any
    if (req.user.role === 'student' && req.user.id != studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attendance = await getMany(
      'SELECT * FROM attendance_records WHERE student_id = ? ORDER BY month DESC',
      [studentId]
    );

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/attendance/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
     
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ error: 'Month is required' });
    }
       if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }  

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    let attendanceData = [];

    if (fileExt === '.csv') {
      // Parse CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            attendanceData.push(row);
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      // Parse Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      attendanceData = XLSX.utils.sheet_to_json(worksheet);
    }

    // Process attendance data
    const processedData = [];
    for (const row of attendanceData) {
      const rollNoRaw = row['Roll No'] || row['roll_no'] || row['RollNo'];
      const rollNo = String(rollNoRaw).replace(/[^0-9]/g, '').trim(); // keep only digits

      const workingDays = parseInt(row['Working Days'] || row['working_days'] || row['WorkingDays']);
      const presentDays = parseInt(row['Present Days'] || row['present_days'] || row['PresentDays']);

      if (!rollNo || isNaN(workingDays) || isNaN(presentDays)) {
        continue;
      }

      // Find student by roll number
      const student = await getOne(
        'SELECT id FROM students WHERE roll_no = ?',
        [rollNo]
      );

      if (!student) {
        continue;
      }

      processedData.push({
        student_id: student.id,
        month,
        working_days: workingDays,
        present_days: presentDays
      });
     //Attendance updated Automatically
      await executeQuery(`
      UPDATE students
      SET attendance_percentage = (
        SELECT 
          ROUND(SUM(present_days) / SUM(working_days) * 100, 2)
        FROM attendance_records
        WHERE student_id = ?
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [student.id, student.id]);
      
    }

    if (processedData.length === 0) {
      fs.unlinkSync(filePath); // Clean up uploaded file
      return res.status(400).json({ error: 'No valid attendance data found in file' });
    }

    // Insert/update attendance records
    for (const record of processedData) {
      await executeQuery(
        `INSERT INTO attendance_records (student_id, month, working_days, present_days) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         working_days = VALUES(working_days), 
         present_days = VALUES(present_days)`,
        [record.student_id, record.month, record.working_days, record.present_days]
      );
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({ 
      message: 'Attendance uploaded successfully',
      recordsProcessed: processedData.length
    });
  } catch (error) {
    console.error('Upload attendance error:', error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get total students
    const totalStudentsResult = await getOne('SELECT COUNT(*) as count FROM students');
    const totalStudents = totalStudentsResult.count;

    // Get average attendance
    const avgResult = await getOne('SELECT AVG(attendance_percentage) as avg_attendance FROM students');
    const averageAttendance = avgResult.avg_attendance || 0;

    // Get students with low attendance (< 75%)
    const lowAttendanceResult = await getOne('SELECT COUNT(*) as count FROM students WHERE attendance_percentage < 75');
    const lowAttendanceCount = lowAttendanceResult.count;

    // Get recent attendance records count
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const recentRecordsResult = await getOne('SELECT COUNT(*) as count FROM attendance_records WHERE month = ?', [currentMonth]);
    const recentRecords = recentRecordsResult.count;

    res.json({
      totalStudents: totalStudents || 0,
      averageAttendance: Math.round(averageAttendance * 100) / 100,
      lowAttendanceCount: lowAttendanceCount || 0,
      recentRecords: recentRecords || 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile update routes
app.put('/api/profile/student/:id', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    
    if (req.user.role !== 'student' || req.user.id != studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    // If password change is requested
    if (currentPassword && newPassword) {
      const student = await getOne(
        'SELECT password_hash FROM students WHERE id = ?',
        [studentId]
      );

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, student.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await updateRecord(
        'UPDATE students SET name = ?, email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, email, passwordHash, studentId]
      );
    } else {
      await updateRecord(
        'UPDATE students SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, email, studentId]
      );
    }

    const updatedStudent = await getOne(
      'SELECT id, name, roll_no, email FROM students WHERE id = ?',
      [studentId]
    );

    res.json({
      id: updatedStudent.id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      rollNo: updatedStudent.roll_no
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profile/admin/:id', authenticateToken, async (req, res) => {
  try {
    const adminId = req.params.id;
    
    if (req.user.role !== 'admin' || req.user.id != adminId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { fullName, email, currentPassword, newPassword } = req.body;

    // If password change is requested
    if (currentPassword && newPassword) {
      const admin = await getOne(
        'SELECT password_hash FROM admins WHERE id = ?',
        [adminId]
      );

      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await updateRecord(
        'UPDATE admins SET full_name = ?, email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [fullName, email, passwordHash, adminId]
      );
    } else {
      await updateRecord(
        'UPDATE admins SET full_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [fullName, email, adminId]
      );
    }

    const updatedAdmin = await getOne(
      'SELECT id, username, email, full_name FROM admins WHERE id = ?',
      [adminId]
    );

    res.json({
      id: updatedAdmin.id,
      username: updatedAdmin.username,
      email: updatedAdmin.email,
      fullName: updatedAdmin.full_name
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:5173/login`);
  console.log(`🔐 Default Admin: username=admin, password=admin123`);
});