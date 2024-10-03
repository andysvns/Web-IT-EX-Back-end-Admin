var express = require("express");
var router = express.Router();
const { pool } = require("../db");

//List Task
//Create List Task
router.post("/create", async (req, res) => {
  const { icon, title, desc } = req.body;
  console.log("Task creation attempt for title:", title);

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  try {
    const created_at = new Date();
    const updated_at = new Date();
    const stt = 1;

    const [result] = await pool.execute(
      "INSERT INTO list_task (icon, title, `desc`, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?)",
      [icon, title, desc, created_at, updated_at, stt]
    );

    console.log("Item creation successful for title:", title);

    res.json({
      success: true,
      message: "Item created successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("Item creation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//Get All List Task
router.get("/getall", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM list_task WHERE stt = 1");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve records", details: error.message });
  }
});

//Get one List Task
router.get("/view/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters

  try {
    // Use parameterized query to prevent SQL injection
    const [result] = await pool.query(
      "SELECT * FROM list_task WHERE list_task_id = ?",
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

//Update List Task
router.put("/update/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters
  const { icon, title, desc } = req.body; // Extract the contact details from the request body

  try {
    // Use parameterized query to update the contact record, preventing SQL injection
    const [result] = await pool.query(
      "UPDATE list_task SET icon = ?, title = ?, `desc` = ?, updated_at = CURRENT_TIMESTAMP WHERE list_task_id = ?",
      [icon, title, desc, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Item updated successfully" }); // Respond with success if a record was updated
    } else {
      res.status(404).json({ message: "Item not found" }); // If no record was updated, return 404
    }
  } catch (error) {
    console.error("Error updating Item by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to update record", details: error.message });
  }
});

//Delete one List Task
router.put("/del/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE list_task SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE list_task_id = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "stt field updated successfully" });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    console.error("Error updating stt field by ID:", error);
    res.status(500).json({
      error: "Failed to update stt field",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
