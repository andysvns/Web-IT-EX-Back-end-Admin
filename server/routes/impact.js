var express = require("express");
var router = express.Router();
const { pool } = require("../db");
const fs = require("fs");
const fsSync = require("fs");

const path = require("path");

const upload = require("../controllers/uploadConfig");

//Create Our Partner
router.post(
  "/create",
  upload.fields([{ name: "img" }, { name: "img_hover" }]),
  async (req, res) => {
    try {
      const { num_text, desc } = req.body;
      console.log("Item creation attempt for item:", num_text);

      // Validate required fields
      if (!num_text || !desc) {
        return res.status(400).json({
          success: false,
          message: "Number and description are required",
        });
      }

      let imgPath = null;
      let imgHoverPath = null;

      if (req.files) {
        if (req.files.img && req.files.img[0]) {
          console.log("Uploaded file img:", req.files.img[0]);
          imgPath = req.files.img[0].path;
        } else {
          console.log("No file uploaded for img");
        }

        if (req.files.img_hover && req.files.img_hover[0]) {
          console.log("Uploaded file img_hover:", req.files.img_hover[0]);
          imgHoverPath = req.files.img_hover[0].path;
        } else {
          console.log("No file uploaded for img_hover");
        }
      } else {
        console.log("No files uploaded");
      }

      const created_at = new Date();
      const updated_at = new Date();
      const stt = 1;

      // Prepare parameters
      const params = [
        imgPath,
        imgHoverPath,
        num_text,
        desc, // desc is now guaranteed to have a value
        created_at,
        updated_at,
        stt,
      ];

      // Log the parameters for debugging
      console.log("SQL Parameters:", params);

      // Insert the new item into the database
      const [result] = await pool.execute(
        "INSERT INTO impact_num (img, img_hover, num_text, `desc`, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        params
      );

      console.log("Item creation successful for num_text:", num_text);

      res.json({
        success: true,
        message: "Item created successfully",
        taskId: result.insertId,
      });
    } catch (error) {
      console.error("Item creation error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

//Get all imapct
router.get("/getall", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM impact_num WHERE stt = 1"
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
      img_hover: items.img_hover
        ? `${req.protocol}://${req.get("host")}/uploads/${items.img_hover
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
});

router.get("/view/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters

  try {
    // Use parameterized query to prevent SQL injection
    const [results] = await pool.query(
      "SELECT * FROM impact_num WHERE impact_num_id = ? AND stt = 1",
      [id]
    );

    if (results.length > 0) {
      const item = results[0];
      const modifiedItem = {
        ...item,
        img: item.img
          ? `${req.protocol}://${req.get("host")}/uploads/${item.img
              .split("/")
              .pop()
              .split("\\")
              .pop()}`
          : null,
        img_hover: item.img_hover
          ? `${req.protocol}://${req.get("host")}/uploads/${item.img_hover
              .split("/")
              .pop()
              .split("\\")
              .pop()}`
          : null,
      };

      res.status(200).json(modifiedItem); // Send the modified item as a response
    } else {
      res.status(404).json({ message: "Item not found" }); // If no item is found, return 404
    }
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve record", details: error.message });
  }
});

router.put(
  "/update/:id",
  upload.fields([{ name: "img" }, { name: "img_hover" }]),
  async (req, res) => {
    const { id } = req.params;
    const { num_text, desc } = req.body;

    try {
      console.log("Item update attempt for item:", id);

      const [currentPartner] = await pool.query(
        "SELECT img, img_hover FROM impact_num WHERE impact_num_id = ?",
        [id]
      );

      if (currentPartner.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      let imgPath = currentPartner[0].img;
      let imgHoverPath = currentPartner[0].img_hover;

      if (req.files) {
        if (req.files.img && req.files.img[0]) {
          console.log("New img file uploaded:", req.files.img[0]);
          await deleteOldFile(imgPath);
          imgPath = `uploads/${req.files.img[0].filename}`;
        }

        if (req.files.img_hover && req.files.img_hover[0]) {
          console.log("New img_hover file uploaded:", req.files.img_hover[0]);
          await deleteOldFile(imgHoverPath);
          imgHoverPath = `uploads/${req.files.img_hover[0].filename}`;
        }
      }

      const [result] = await pool.query(
        "UPDATE impact_num SET img = ?, img_hover = ?, num_text = ?, `desc` = ?, updated_at = CURRENT_TIMESTAMP WHERE impact_num_id = ?",
        [imgPath, imgHoverPath, num_text, desc, id]
      );

      if (result.affectedRows > 0) {
        console.log("Item update successful for id:", id);
        res
          .status(200)
          .json({ success: true, message: "Item updated successfully" });
      } else {
        res.status(404).json({
          success: false,
          message: "Item not found or no changes made",
        });
      }
    } catch (error) {
      console.error("Error updating partner by ID:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        details: error.message,
      });
    }
  }
);

async function deleteOldFile(filePath) {
  if (filePath) {
    const fullPath = path.join(__dirname, "..", filePath);
    if (fsSync.existsSync(fullPath)) {
      try {
        await fs.unlink(fullPath);
        console.log("Old file deleted:", filePath);
      } catch (err) {
        console.error("Error deleting old file:", err);
      }
    } else {
      console.warn("Old file not found, skipping deletion:", filePath);
    }
  }
}

//Delete our partner

router.put("/del/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get the image paths for the given partner ID
    const [rows] = await pool.query(
      "SELECT img, img_hover FROM impact_num WHERE impact_num_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    const imgPath = rows[0].img;
    const imgHoverPath = rows[0].img_hover;

    // Function to remove image from filesystem
    const removeImage = (filePath) => {
      if (filePath) {
        const fullPath = path.resolve(__dirname, "..", filePath);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          } else {
            console.log("Image deleted successfully:", filePath);
          }
        });
      }
    };

    // Remove both images from the filesystem if they exist
    removeImage(imgPath);
    removeImage(imgHoverPath);

    // Update the stt field to 0 and clear image paths
    const [result] = await pool.query(
      "UPDATE impact_num SET stt = 0, img = NULL, img_hover = NULL, updated_at = CURRENT_TIMESTAMP WHERE impact_num_id = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "stt field updated and images deleted successfully",
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
});

module.exports = router;
