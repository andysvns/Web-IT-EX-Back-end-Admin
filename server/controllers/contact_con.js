const { pool } = require("../db");

const contactGetall = [
    async (req, res) => {
        try {
          const [results] = await pool.query("SELECT * FROM contact WHERE stt = 1");
          res.status(200).json(results);
        } catch (error) {
          console.error("Error fetching data from the database:", error);
          res
            .status(500)
            .json({ error: "Failed to retrieve records", details: error.message });
        }
      }
]
const contactGetone = [
    async (req, res) => {
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
      }
]
const contactUpdate = [
    async (req, res) => {
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
      }
]



  module.exports = {
    contactGetall,
    contactGetone,
    contactUpdate,
  };