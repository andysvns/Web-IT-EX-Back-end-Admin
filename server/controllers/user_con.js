const { pool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userCreate = async (req, res) => {
  let { username, password, confirmpassword, name } = req.body;
  console.log("Create attempt for username:", username);

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

    const created_at = new Date();
    const updated_at = new Date();
    const stt = 1;

    const [result] = await pool.execute(
      "INSERT INTO admin (username, password, name, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, name, created_at, updated_at, stt]
    );

    const token = jwt.sign(
      { userId: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Create successful for user:", username);

    res.json({ success: true, message: "Registration successful", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const userGetAll = [
  async (req, res) => {
    try {
      const [results] = await pool.query(
        "SELECT id, username, name, created_at, updated_at FROM admin WHERE stt = 1"
      );
      res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching data from the database:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve records", details: error.message });
    }
  },
];

// const resetPassword = async (req, res) => {
//   // Check if the user is authenticated
//   if (!req.user || !req.user.id) {
//     return res.status(401).json({ success: false, message: "User not authenticated" });
//   }

//   const { oldPassword, newPassword, confirmNewPassword } = req.body;
//   const userId = req.user.id;

//   console.log("Password reset attempt for user ID:", userId);

//   if (!oldPassword || !newPassword || !confirmNewPassword) {
//     return res.status(400).json({ success: false, message: "All fields are required" });
//   }

//   if (newPassword !== confirmNewPassword) {
//     return res.status(400).json({ success: false, message: "New passwords do not match" });
//   }

//   if (newPassword.length < 8) {
//     return res.status(400).json({ success: false, message: "New password must be at least 8 characters long" });
//   }

//   try {
//     // Fetch the user from the database
//     const [users] = await pool.execute(
//       "SELECT * FROM admin WHERE id = ?",
//       [userId]
//     );

//     if (users.length === 0) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const user = users[0];

//     // Verify the old password
//     const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
//     if (!isOldPasswordValid) {
//       return res.status(401).json({ success: false, message: "Old password is not correct" });
//     }

//     // Check if the new password is the same as the old password
//     const isSamePassword = await bcrypt.compare(newPassword, user.password);
//     if (isSamePassword) {
//       return res.status(400).json({ success: false, message: "New password must be different from the current password" });
//     }

//     // Hash the new password
//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);

//     // Update the password in the database
//     const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
//     await pool.execute(
//       "UPDATE admin SET password = ?, updated_at = ? WHERE id = ?",
//       [hashedNewPassword, updated_at, userId]
//     );

//     console.log("Password reset successful for user ID:", userId);

//     res.json({ success: true, message: "Password reset successful" });
//   } catch (error) {
//     console.error("Password reset error:", error);
//     res.status(500).json({ success: false, message: "Server error. Please try again later." });
//   }
// };

const userResetPassword = async (req, res) => {
  const { username, oldPassword, newPassword, confirmNewPassword } = req.body;

  console.log("Received reset password request for username:", username);

  if (!username || !oldPassword || !newPassword || !confirmNewPassword) {
    console.log("Missing required fields");
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (newPassword !== confirmNewPassword) {
    console.log("New passwords do not match");
    return res
      .status(400)
      .json({ success: false, message: "New passwords do not match" });
  }

  try {
    // Check if the user exists and is active (stt = 1)
    const [user] = await pool.execute(
      "SELECT * FROM admin WHERE username = ? AND stt = 1", // stt = 1 means active user
      [username]
    );

    // If no user is found, return a 404 error
    if (user.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userRecord = user[0]; // Get the first user (should be only one)

    // Verify the old password using bcrypt
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      userRecord.password
    );
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // Hash the new password using bcrypt
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Get the current date and time for the update
    const updated_at = new Date();

    // Update the user's password and the updated_at timestamp in the database
    await pool.execute(
      "UPDATE admin SET password = ?, updated_at = ? WHERE id = ?",
      [hashedNewPassword, updated_at, userRecord.id]
    );

    // Return a success message
    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);

    // Handle any server errors
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  userCreate,
  userGetAll,
  // resetPassword,
  userResetPassword,
};
