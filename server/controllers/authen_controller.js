const { pool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    let { username, password } = req.body;
    console.log("Login attempt for username:", username);

    try {
        const [rows] = await pool.execute(
            "SELECT * FROM admin WHERE username = ?",
            [username]
        );

        if (rows.length > 0) {
            const match = await bcrypt.compare(password, rows[0].password);
            if (match) {
                const token = jwt.sign(
                    { userId: rows[0].id, username: rows[0].username },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );
                res.json({ success: true, message: "Login successful", token });
            } else {
                res
                    .status(401)
                    .json({ success: false, message: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


module.exports = { login };
