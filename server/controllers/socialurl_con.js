const { pool } = require("../db");

const socialUrlCreate = [
  async (req, res) => {
    try {
      const { social_type_id, title, social_url } = req.body;
      console.log("Item creation attempt for social name:", title);

      if (!title || !social_type_id) {
        return res.status(400).json({
          success: false,
          message: "Social Url name and stack type are required",
        });
      }

      const created_at = new Date();
      const updated_at = new Date();
      const stt = 1;

      // Insert the new stack tool into the database
      const [result] = await pool.execute(
        "INSERT INTO social_url (title, social_type_id, social_url, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?)",
        [title, social_type_id, social_url, created_at, updated_at, stt]
      );

      console.log("Item creation successful for Social Url name:", title);

      res.json({
        success: true,
        message: "Social Url created successfully",
        socialUrlId: result.insertId,
      });
    } catch (error) {
      console.error("Item creation error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
];

const socialUrlGetAll = [
  async (req, res) => {
    try {
      const [results] = await pool.query(`
           SELECT * FROM 
              social_url su
            JOIN 
              social_type st ON su.social_type_id = st.social_type_id
            WHERE 
              su.stt = 1
          `);

      res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching data from the database:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve records", details: error.message });
    }
  },
];

const socialUrlGetOne = [
  async (req, res) => {
    const { id } = req.params; // Extract the 'id' from the request parameters

    try {
      // Use parameterized query to prevent SQL injection
      const [results] = await pool.query(
        "SELECT * FROM social_url WHERE social_url_id = ? AND stt = 1",
        [id]
      );

      if (results.length > 0) {
        res.status(200).json(results[0]); // Send the found item as a response
      } else {
        res.status(404).json({ message: "Item not found" }); // If no item is found, return 404
      }
    } catch (error) {
      console.error("Error fetching item by ID:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve record", details: error.message });
    }
  },
];

const socialUrlUpdate = [
  async (req, res) => {
    try {
      const { id, title, social_type_id, social_url } = req.body;
      console.log("Social URL update attempt for ID:", id);

      if (!id || !title || !social_type_id) {
        return res.status(400).json({
          success: false,
          message: "Social URL ID, name, and type are required",
        });
      }

      // Get current social URL info to check if it exists
      const [currentSocialUrl] = await pool.query(
        "SELECT * FROM social_url WHERE social_url_id = ?",
        [id]
      );

      if (currentSocialUrl.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Social URL not found",
        });
      }

      const updated_at = new Date();

      // Update the social URL in the database
      const [result] = await pool.execute(
        "UPDATE social_url SET title = ?, social_type_id = ?, social_url = ?, updated_at = ? WHERE social_url_id = ?",
        [title, social_type_id, social_url, updated_at, id]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to update social URL",
        });
      }

      console.log("Social URL update successful for ID:", id);

      res.json({
        success: true,
        message: "Social URL updated successfully",
        socialUrlId: id,
      });
    } catch (error) {
      console.error("Social URL update error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        details: error.message,
      });
    }
  },
];

const socialUrlDelete = [
  async (req, res) => {
    const { id } = req.params;

    try {
      // Update the stt field to 0
      const [result] = await pool.query(
        "UPDATE social_url SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE social_url_id = ?",
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
  socialUrlCreate,
  socialUrlGetAll,
  socialUrlGetOne,
  socialUrlUpdate,
  socialUrlDelete,
};
