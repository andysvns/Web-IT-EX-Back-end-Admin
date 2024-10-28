const { pool } = require("../db");

const socialtypeCreate = [
  async (req, res) => {
    const { s_type_name, icon } = req.body;  // Fixed typo in variable name
    console.log("Social type creation attempt:", { name: s_type_name, icon });

    // Input validation
    if (!s_type_name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    if (!icon) {
      return res
        .status(400)
        .json({ success: false, message: "Icon is required" });
    }

    try {
      const created_at = new Date();
      const updated_at = new Date();
      const stt = 1;

      // Sanitize inputs
      const sanitizedName = s_type_name.trim();
      const sanitizedIcon = icon.trim();

      const [result] = await pool.execute(
        "INSERT INTO social_type (s_type_name, icon, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?)",
        [sanitizedName, sanitizedIcon, created_at, updated_at, stt]
      );

      console.log("Social type created successfully:", {
        id: result.insertId,
        name: sanitizedName
      });

      res.status(201).json({
        success: true,
        message: "Social type created successfully",
        data: {
          social_type_id: result.insertId,
          s_type_name: sanitizedName,
          icon: sanitizedIcon,
          created_at,
          updated_at,
          stt
        }
      });
    } catch (error) {
      console.error("Social type creation error:", error);
      
      // Check for duplicate entry
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          success: false, 
          message: "A social type with this name already exists" 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: "Failed to create social type",
        error: error.message 
      });
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
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update social_type table
      const [socialTypeResult] = await connection.query(
        "UPDATE social_type SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE social_type_id = ?",
        [id]
      );

      // Update social_url table
      const [socialUrlResult] = await connection.query(
        "UPDATE social_url SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE social_type_id = ?",
        [id]
      );

      await connection.commit();

      if (socialTypeResult.affectedRows > 0 || socialUrlResult.affectedRows > 0) {
        res.status(200).json({ 
          message: "Records updated successfully",
          details: {
            social_type_updated: socialTypeResult.affectedRows,
            social_url_updated: socialUrlResult.affectedRows
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
  socialtypeCreate,
  socialtypeGetAll,
  socialtypeGetOne,
  socialtypeUpdate,
  socialtypeDelete,
};
