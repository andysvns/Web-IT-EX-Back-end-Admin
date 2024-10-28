const { pool } = require("../db");

const stacktypeCreate = [
  async (req, res) => {
    const { stack_name } = req.body;
    console.log("Task creation attempt for Stack name:", stack_name);

    if (!stack_name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    try {
      const created_at = new Date();
      const updated_at = new Date();
      const stt = 1;

      const [result] = await pool.execute(
        "INSERT INTO stack_type ( stack_name , created_at, updated_at, stt) VALUES (?, ?, ?, ?)",
        [stack_name, created_at, updated_at, stt]
      );

      console.log("Item creation successful for Stack name:", stack_name);

      res.json({
        success: true,
        message: "Item created successfully",
        taskId: result.insertId,
      });
    } catch (error) {
      console.error("Item creation error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
];

const stacktypeGetAll = [
  async (req, res) => {
    try {
      const [results] = await pool.query(
        "SELECT * FROM stack_type WHERE stt = 1"
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
const stacktypeGetOne = [
  async (req, res) => {
    const { id } = req.params; // Extract the 'id' from the request parameters

    try {
      // Use parameterized query to prevent SQL injection
      const [result] = await pool.query(
        "SELECT * FROM stack_type WHERE stack_type_id = ?",
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
  },
];


const stacktypeUpdate = [
  async (req, res) => {
    const { id } = req.params; // Extract the 'id' from the request parameters
    const { stack_name } = req.body; // Extract the contact details from the request body

    try {
      // Use parameterized query to update the contact record, preventing SQL injection
      const [result] = await pool.query(
        "UPDATE stack_type SET stack_name = ?, updated_at = CURRENT_TIMESTAMP WHERE stack_type_id = ?",
        [stack_name, id]
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
  },
];

const stacktypeDelete = [
  async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update stack_type table
      const [stackTypeResult] = await connection.query(
        "UPDATE stack_type SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE stack_type_id = ?",
        [id]
      );

      // Update our_stack_tool table
      const [ourStackToolResult] = await connection.query(
        "UPDATE our_stack_tool SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE stack_type_id = ?",
        [id]
      );

      await connection.commit();

      if (stackTypeResult.affectedRows > 0 || ourStackToolResult.affectedRows > 0) {
        res.status(200).json({ 
          message: "Records updated successfully",
          details: {
            stack_type_updated: stackTypeResult.affectedRows,
            our_stack_tool_updated: ourStackToolResult.affectedRows
          }
        });
      } else {
        res.status(404).json({ message: "No records found to update" });
      }
    } catch (error) {
      await connection.rollback();
      console.error("Error updating stt fields:", error);
      res.status(500).json({
        error: "Failed to update records",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    } finally {
      connection.release();
    }
  },
];

module.exports = {
  stacktypeCreate,
  stacktypeGetAll,
  stacktypeGetOne,
  stacktypeUpdate,
  stacktypeDelete,
};
