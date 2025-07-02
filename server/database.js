import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'attendancesys',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);


// Test database connection
export const testConnection = async () => {
   try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ MySQL connected. Test result:', rows[0].result); // Should print 2
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
};

// Execute query with error handling
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a single record
export const getOne = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results[0] || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get multiple records
export const getMany = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Insert record and return inserted ID
export const insertRecord = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return result.insertId;
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
};

// Update record and return affected rows
export const updateRecord = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
};

// Delete record and return affected rows
export const deleteRecord = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return result.affectedRows;
  } catch (error) {
    console.error('Database delete error:', error);
    throw error;
  }
};

// Execute transaction
export const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;