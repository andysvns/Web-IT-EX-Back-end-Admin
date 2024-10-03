var express = require("express");
var router = express.Router();
const { pool } = require("../db");
const fs = require("fs").promises;
const fsSync = require("fs");

const path = require("path");

const upload = require("../controllers/uploadConfig");

//Create Our Partner
router.post("/create", upload.single("mem_img"), async (req, res) => {
  try {
    const { mem_name, mem_age, mem_position, mem_address } = req.body;
    console.log("Item creation attempt for member name:", mem_name);

    if (!mem_name) {
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

    const [result] = await pool.execute(
      "INSERT INTO team_member (mem_name, mem_age, mem_position, mem_img, mem_address, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        mem_name,
        mem_age,
        mem_position,
        imgPath,
        mem_address,
        created_at,
        updated_at,
        stt,
      ]
    );

    console.log("Item creation successful for member name:", mem_name);

    res.json({
      success: true,
      message: "Item created successfully",
      memberId: result.insertId,
    });
  } catch (error) {
    console.error("Item creation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//Get all Our Partner
router.get("/getall", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM team_member WHERE stt = 1"
    );

    const modifiedResults = results.map((items) => ({
      ...items,
      mem_img: items.mem_img
        ? `${req.protocol}://${req.get("host")}/uploads/${items.mem_img
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

// Get one Our Partner
router.get("/view/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters

  try {
    // Use parameterized query to prevent SQL injection
    const [results] = await pool.query(
      "SELECT * FROM team_member WHERE team_mem_id = ? AND stt = 1",
      [id]
    );

    if (results.length > 0) {
      const item = results[0];
      const modifiedpartner = {
        ...item,
        mem_img: item.mem_img
          ? `${req.protocol}://${req.get("host")}/uploads/${item.mem_img
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
});

//Update Member
router.put("/update/:id", upload.single("mem_img"), async (req, res) => {
  const { id } = req.params;
  const { mem_name, mem_age, mem_position, mem_address } = req.body;

  try {
    const [currentpartner] = await pool.query(
      "SELECT mem_img FROM team_member WHERE team_mem_id = ?",
      [id]
    );

    if (currentpartner.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    let imgPath = currentpartner[0].mem_img;

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
      "UPDATE team_member SET mem_img = ?, mem_name = ?, mem_age = ?, mem_position = ?, mem_address = ?, updated_at = CURRENT_TIMESTAMP WHERE team_mem_id = ?",
      [imgPath, mem_name, mem_age, mem_position, mem_address, id]
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
});

//Delete Member
router.put("/del/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get the image path for the given partner ID
    const [rows] = await pool.query(
      "SELECT mem_img FROM team_member WHERE team_mem_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    const imgPath = rows[0].mem_img;

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
      "UPDATE team_member SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE team_mem_id = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ message: "stt field updated and image deleted successfully" });
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
