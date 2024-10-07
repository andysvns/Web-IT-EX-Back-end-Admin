const { pool } = require("../db");

const socialtypeCreate = [
  async (req, res) => {
    const { s_type_nmae, icon } = req.body;
    console.log("Task creation attempt for Social name:", s_type_nmae);

    if (!s_type_nmae) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    try {
      const created_at = new Date();
      const updated_at = new Date();
      const stt = 1;

      const [result] = await pool.execute(
        "INSERT INTO social_type ( s_type_name , icon , created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?)",
        [s_type_nmae, icon, created_at, updated_at, stt]
      );

      console.log("Item creation successful for Stack name:", s_type_nmae);

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

const socialtypeGetAll = [
  async (req, res) => {
    try {
      const [results] = await pool.query(
        "SELECT * FROM social_type WHERE stt = 1"
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

const socialtypeGetOne = [
  async (req, res) => {
    const { id } = req.params; // Extract the 'id' from the request parameters

    try {
      // Use parameterized query to prevent SQL injection
      const [result] = await pool.query(
        "SELECT * FROM social_type WHERE social_type_id = ?",
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
const socialtypeUpdate = [
  async (req, res) => {
    const { id } = req.params; // Extract the 'id' from the request parameters
    const { s_type_name } = req.body; // Extract the contact details from the request body
    const { icon } = req.body; // Extract the contact details from the request body

    try {
      // Use parameterized query to update the contact record, preventing SQL injection
      const [result] = await pool.query(
        "UPDATE social_type SET s_type_name = ?, icon = ? , updated_at = CURRENT_TIMESTAMP WHERE social_type_id = ?",
        [s_type_name, icon, id]
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

const socialtypeDelete = [
  async (req, res) => {
    const { id } = req.params;

    try {
      const [result] = await pool.query(
        "UPDATE social_type SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE social_type_id = ?",
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
  },
];

module.exports = {
  socialtypeCreate,
  socialtypeGetAll,
  socialtypeGetOne,
  socialtypeUpdate,
  socialtypeDelete,
};
