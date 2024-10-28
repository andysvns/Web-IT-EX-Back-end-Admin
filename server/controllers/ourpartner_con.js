const { pool } = require("../db");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const upload = require("../controllers/uploadConfig");

const partnerCreate = [
  upload.single("img"),
  async (req, res) => {
    try {
      const { partner_name } = req.body;
      console.log("Item creation attempt for parter name:", partner_name);

      if (!partner_name) {
        return res
          .status(400)
          .json({ success: false, message: "Name is required" });
      }

      let imgPath = null;
      if (req.file) {
        console.log("Uploaded file:", req.file);
        imgPath = req.file.path;
      } else {
        console.log("No file uploaded");
      }

      const created_at = new Date();
      const updated_at = new Date();
      const stt = 1;

      // Insert the new partner into the database
      const [result] = await pool.execute(
        "INSERT INTO our_partner (img, partner_name, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?)",
        [imgPath, partner_name, created_at, updated_at, stt]
      );

      console.log("Item creation successful for partner name:", partner_name);

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
const partnerGetAll = [
  async (req, res) => {
    try {
      const [results] = await pool.query(
        "SELECT * FROM our_partner WHERE stt = 1"
      );

      const modifiedResults = results.map((items) => ({
        ...items,
        img: items.img
          ? `${req.protocol}://${req.get("host")}/uploads/${items.img
              .split("/")
              .pop()
              .split("\\")
              .pop()}`
          : null,
      }));

      res.status(200).json(modifiedResults);
    } catch (error) {
      console.error("Error fetching data from the database:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve records", details: error.message });
    }
  },
];
const partnerGetOne = [
  async (req, res) => {
    const { id } = req.params; // Extract the 'id' from the request parameters

    try {
      // Use parameterized query to prevent SQL injection
      const [results] = await pool.query(
        "SELECT * FROM our_partner WHERE our_partner_id = ? AND stt = 1",
        [id]
      );

      if (results.length > 0) {
        const item = results[0];
        const modifiedpartner = {
          ...item,
          img: item.img
            ? `${req.protocol}://${req.get("host")}/uploads/${item.img
                .split("/")
                .pop()
                .split("\\")
                .pop()}`
            : null,
        };

        res.status(200).json(modifiedpartner); // Send the modified partner as a response
      } else {
        res.status(404).json({ message: "Item not found" }); // If no partner is found, return 404
      }
    } catch (error) {
      console.error("Error fetching item by ID:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve record", details: error.message });
    }
  },
];
const partnerUpdate = [
  upload.single("img"),
  async (req, res) => {
    const { id } = req.params;
    const { partner_name } = req.body;

    try {
      const [currentpartner] = await pool.query(
        "SELECT img FROM our_partner WHERE our_partner_id = ?",
        [id]
      );

      if (currentpartner.length === 0) {
        return res.status(404).json({ message: "Item not found" });
      }

      let imgPath = currentpartner[0].img;

      if (req.file) {
        console.log("New file uploaded:", req.file);

        if (imgPath) {
          // Full path to the old image
          const fullImgPath = path.join(
            __dirname,
            "..",
            "uploads",
            path.basename(imgPath)
          );

          // Check if the file exists before attempting to delete
          if (fsSync.existsSync(fullImgPath)) {
            try {
              await fs.unlink(fullImgPath);
              console.log("Old image deleted:", imgPath);
            } catch (err) {
              console.error("Error deleting old image:", err);
            }
          } else {
            console.warn("Old image not found, skipping deletion:", imgPath);
          }
        }

        // Store just the filename
        imgPath = `uploads/${req.file.filename}`;
      }

      const [result] = await pool.query(
        "UPDATE our_partner SET img = ?, partner_name = ?, updated_at = CURRENT_TIMESTAMP WHERE our_partner_id = ?",
        [imgPath, partner_name, id]
      );

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Item updated successfully" });
      } else {
        res.status(404).json({ message: "Item not found or no changes made" });
      }
    } catch (error) {
      console.error("Error updating partner by ID:", error);
      res
        .status(500)
        .json({ error: "Failed to update record", details: error.message });
    }
  },
];
const partnerDelete = [
  async (req, res) => {
    const { id } = req.params;

    try {
      // Get the image path for the given partner ID
      const [rows] = await pool.query(
        "SELECT img FROM our_partner WHERE our_partner_id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Record not found" });
      }

      const imgPath = rows[0].img;

      // Remove the image from the filesystem if it exists
      if (imgPath) {
        const fullPath = path.resolve(imgPath);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          } else {
            console.log("Image deleted successfully:", imgPath);
          }
        });
      }

      // Update the stt field to 0
      const [result] = await pool.query(
        "UPDATE our_partner SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE our_partner_id = ?",
        [id]
      );

      if (result.affectedRows > 0) {
        res
          .status(200)
          .json({
            message: "stt field updated and image deleted successfully",
          });
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
  partnerCreate,
  partnerGetAll,
  partnerGetOne,
  partnerUpdate,
  partnerDelete,
};
