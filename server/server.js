const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to the database:', error.message);
    console.log('Database connection details:');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    // Don't log the password for security reasons
  });


   // Login endpoint
   app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    try {
      const [rows] = await pool.execute(
        'SELECT * FROM admin WHERE username = ?',
        [username]
      );
      console.log('Database query result:', rows);

      if (rows.length > 0) {
        const match = await bcrypt.compare(password, rows[0].password);
        console.log('Password match:', match);
        if (match) {
          // Generate a token
          const token = jwt.sign(
            { userId: rows[0].id, username: rows[0].username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );
          res.json({ success: true, message: 'Login successful', token });
        } else {
          res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      } else {
        res.status(401).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));