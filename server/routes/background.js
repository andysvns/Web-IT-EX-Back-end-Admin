var express = require("express");
var router = express.Router();
const { pool } = require("../db");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const upload = require("../controllers/uploadConfig");

router.get("/getfirst", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM background WHERE stt = 1 LIMIT 1"
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "No item found" });
    }

    // Modify image path for the product
    const modifiedResult = {
      ...results[0],
      img: results[0].img
        ? `${req.protocol}://${req.get("host")}/uploads/${results[0].img
            .split("/")
            .pop()
            .split("\\")
            .pop()}`
        : null,
    };

    res.status(200).json(modifiedResult);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve record", details: error.message });
  }
});

router.get("/view/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters

  try {
    // Use parameterized query to prevent SQL injection
    const [results] = await pool.query(
      "SELECT * FROM background WHERE background = ? AND stt = 1",
      [id]
    );

    if (results.length > 0) {
      const about_us = results[0];
      const modifiedabout_us = {
        ...about_us,
        img: about_us.img
          ? `${req.protocol}://${req.get("host")}/uploads/${about_us.img
              .split("/")
              .pop()
              .split("\\")
              .pop()}`
          : null,
      };

      res.status(200).json(modifiedabout_us); // Send the modified product as a response
    } else {
      res.status(404).json({ message: "Item not found" }); // If no product is found, return 404
    }
  } catch (error) {
    console.error("Error fetching Item by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve record", details: error.message });
  }
});

router.get("/view/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters

  try {
    // Use parameterized query to prevent SQL injection
    const [results] = await pool.query(
      "SELECT * FROM about_us WHERE about_us_id = ? AND stt = 1",
      [id]
    );

    if (results.length > 0) {
      const about_us = results[0];
      const modifiedabout_us = {
        ...about_us,
        img: about_us.img
          ? `${req.protocol}://${req.get("host")}/uploads/${about_us.img
              .split("/")
              .pop()
              .split("\\")
              .pop()}`
          : null,
      };

      res.status(200).json(modifiedabout_us); // Send the modified product as a response
    } else {
      res.status(404).json({ message: "Item not found" }); // If no product is found, return 404
    }
  } catch (error) {
    console.error("Error fetching Item by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve record", details: error.message });
  }
});

router.put("/update/:id", upload.single("img"), async (req, res) => {
  const { id } = req.params;
  const { img_name } = req.body;

  try {
    const [currentProduct] = await pool.query(
      "SELECT img FROM background WHERE background_id = ?",
      [id]
    );

    if (currentProduct.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    let imgPath = currentProduct[0].img;

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
      "UPDATE background SET img = ?, img_name = ?, updated_at = CURRENT_TIMESTAMP WHERE background_id = ?",
      [imgPath, img_name, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Item updated successfully" });
    } else {
      res.status(404).json({ message: "Item not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating about us by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to update record", details: error.message });
  }
});
module.exports = router;
