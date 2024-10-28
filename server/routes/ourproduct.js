var express = require("express");
var router = express.Router();
const { pool } = require("../db");
const fs = require("fs").promises;
const fsSync = require('fs');

const path = require("path");

const upload = require("../controllers/uploadConfig");

// let fileCounter = 1;
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `image_${fileCounter++}${path.extname(file.originalname)}`);
//   },
// });

// // Initialize multer with the defined storage
// const upload = multer({
//   storage: storage,
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   },
//   limits: { fileSize: 5000000 }, // 5MB limit
// });

// function checkFileType(file, cb) {
//   // Allowed extensions
//   const filetypes = /jpeg|jpg|png|gif/;
//   // Check extension
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb("Error: Images Only!");
//   }
// }

//create our product
router.post("/create", upload.single("img"), async (req, res) => {
  try {
    const { title, desc } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    let imgPath = null;
    if (req.file) {
      imgPath = req.file.path; // Save the uploaded image path
    }

    const created_at = new Date();
    const updated_at = new Date();
    const stt = 1;

    // Insert the new product into the database
    const [result] = await pool.execute(
      "INSERT INTO our_product (img, title, `desc`, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?)",
      [imgPath, title, desc, created_at, updated_at, stt]
    );

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

//Get all our product
router.get("/getall", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM our_product WHERE stt = 1"
    );

    // Modify image path for each product
    const modifiedResults = results.map((product) => ({
      ...product,
      img: product.img
        ? `${req.protocol}://${req.get("host")}/uploads/${product.img
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

//Get one our product
router.get("/view/:id", async (req, res) => {
  const { id } = req.params; // Extract the 'id' from the request parameters

  try {
    // Use parameterized query to prevent SQL injection
    const [results] = await pool.query(
      "SELECT * FROM our_product WHERE our_product_id = ? AND stt = 1",
      [id]
    );

    if (results.length > 0) {
      const product = results[0];
      const modifiedProduct = {
        ...product,
        img: product.img
          ? `${req.protocol}://${req.get("host")}/uploads/${product.img
              .split("/")
              .pop()
              .split("\\")
              .pop()}`
          : null,
      };

      res.status(200).json(modifiedProduct); // Send the modified product as a response
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


// Update Our Product
router.put("/update/:id", upload.single("img"), async (req, res) => {
  const { id } = req.params;
  const { title, desc } = req.body;

  try {
    const [currentProduct] = await pool.query(
      "SELECT img FROM our_product WHERE our_product_id = ?",
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
        const fullImgPath = path.join(__dirname, '..', 'uploads', path.basename(imgPath));
        
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
      "UPDATE our_product SET img = ?, title = ?, `desc` = ?, updated_at = CURRENT_TIMESTAMP WHERE our_product_id = ?",
      [imgPath, title, desc, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Item updated successfully" });
    } else {
      res.status(404).json({ message: "Item not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating product by ID:", error);
    res
      .status(500)
      .json({ error: "Failed to update record", details: error.message });
  }
});


//Delete our product
router.put("/del/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get the image path for the given product ID
    const [rows] = await pool.query(
      "SELECT img FROM our_product WHERE our_product_id = ?",
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
      "UPDATE our_product SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE our_product_id = ?",
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
