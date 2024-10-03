const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create admin table if it doesn't exist
pool
  .query(
    `
    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `
  )
  .then(() => {
    return pool.query("SELECT * FROM admin WHERE username = ?", ["admin"]);
  })
  .then(([rows]) => {
    if (rows.length === 0) {
      const defaultPassword = "admin123"; // Change this for security
      return bcrypt.hash(defaultPassword, 10).then((hashedPassword) => {
        return pool.query(
          "INSERT INTO admin (username, password) VALUES (?, ?)",
          ["admin", hashedPassword]
        );
      });
    }
  })
  .catch(console.error);
module.exports = { pool };
