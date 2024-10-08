const { pool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    let { username, password } = req.body;
    console.log("Login attempt for username:", username);
  
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }
  
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM admin WHERE username = ?",
        [username]
      );
  
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
  
      const match = await bcrypt.compare(password, rows[0].password);
      if (match) {
        const token = jwt.sign(
          { userId: rows[0].id, username: rows[0].username },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        res.json({ success: true, message: "Login successful", token });
      } else {
        res.status(401).json({ success: false, message: "Incorrect password" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "An error occurred during login. Please try again later." });
    }
  };

const register = async (req, res) => {
  // Use app.post instead of router.post
  let { username, password, confirmpassword, fname, lname } = req.body;
  console.log("Register attempt for username:", username);

  if (password !== confirmpassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  try {
    const [existingUser] = await pool.execute(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO admin (username, password, fname ,lname) VALUES (?, ?, ?, ? )",
      [username, hashedPassword, fname, lname]
    );

    const token = jwt.sign(
      { userId: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Registration successful for user:", username);

    res.json({ success: true, message: "Registration successful", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { login, register };
