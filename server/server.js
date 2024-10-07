const express = require("express");

const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const { pool } = require("./db");
// const multer = require("multer");
// const path = require("path");

const authenRouter = require("./routes/authen");
const productRoutes = require("./routes/ourproduct");
const partnerRoutes = require("./routes/ourpartner");
const listtaskRoutes = require("./routes/listtask");
const impactRoutes = require("./routes/impact");
const introRoutes = require("./routes/intro");
const memberRoutes = require("./routes/member");
const backgroundRoutes = require("./routes/background");
const homeaboutusRoutes = require("./routes/homeaboutus");
const stacktoolRoutes = require("./routes/stacktool");
const stacktypeRoutes = require("./routes/stacktype");
const socialtypeRoutes = require("./routes/socialtype");
const socialurlRoutes = require("./routes/socialurl");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/authen", authenRouter);
app.use("/api/products", productRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/listtask", listtaskRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/intro", introRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/background", backgroundRoutes);
app.use("/api/homeabout", homeaboutusRoutes);
app.use("/api/stacktool", stacktoolRoutes);
app.use("/api/stacktype", stacktypeRoutes);
app.use("/api/socialtype", socialtypeRoutes);
app.use("/api/socialurl", socialurlRoutes);

// Database connection

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
  });

// Register endpoint
app.post("/register", async (req, res) => {
  // Use app.post instead of router.post
  const { username, password, confirmpassword, fname, lname } = req.body;
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
});

// Get All Contact
app.get("/contact", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM contact WHERE stt = 1");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve records", details: error.message });
  }
});

//Get One Contact
app.get("/contact/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters

  try {
    // Use parameterized query to prevent SQL injection
    const [result] = await pool.query(
      "SELECT * FROM contact WHERE contact_id = ?",
      [id]
    );

    if (result.length > 0) {
      res.status(200).json(result[0]); // Send the first matching contact as a response
    } else {
      res.status(404).json({ message: "Contact not found" }); // If no contact is found, return 404
    }
  } catch (error) {
    console.error("Error fetching contact by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve record", details: error.message });
  }
});

//Update Contact
app.put("/contact/update/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters
  const { phone_number, email, address_url, address } = req.body; // Extract the contact details from the request body

  try {
    // Use parameterized query to update the contact record, preventing SQL injection
    const [result] = await pool.query(
      "UPDATE contact SET phone_number = ?, email = ?, address_url = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE contact_id = ?",
      [phone_number, email, address_url, address, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Contact updated successfully" }); // Respond with success if a record was updated
    } else {
      res.status(404).json({ message: "Contact not found" }); // If no record was updated, return 404
    }
  } catch (error) {
    console.error("Error updating contact by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to update record", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
