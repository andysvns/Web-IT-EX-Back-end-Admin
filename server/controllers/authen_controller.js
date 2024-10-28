const { pool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  let { username, password } = req.body;
  console.log("Login attempt for username:", username);

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username and password are required" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT id, username, name, password FROM admin WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (match) {
      const token = jwt.sign(
        { userId: rows[0].id, username: rows[0].username },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Include user details in the response
      const userDetails = {
        id: rows[0].id,
        username: rows[0].username,
        name: rows[0].name,
      };

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: userDetails,
      });
    } else {
      res.status(401).json({ success: false, message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred during login. Please try again later.",
      });
  }
};

// In your controller file (e.g., controllers/authController.js)
const getUserDetails = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, username, name, created_at, updated_at FROM admin WHERE id = ?",
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching user details",
      });
  }
};

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = { login, getUserDetails, authenticateToken };
