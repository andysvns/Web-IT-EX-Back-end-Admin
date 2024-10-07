const { pool } = require("../db");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const upload = require("./uploadConfig");

const stacktoolCreate = [
  upload.single("img"),
  async (req, res) => {
    try {
      const { tool_name, stack_type_id } = req.body;
      console.log("Item creation attempt for tool name:", tool_name);

      if (!tool_name || !stack_type_id) {
        return res.status(400).json({
          success: false,
          message: "Tool name and stack type are required",
        });
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

      // Insert the new stack tool into the database
      const [result] = await pool.execute(
        "INSERT INTO our_stack_tool (img, tool_name, stack_type_id, created_at, updated_at, stt) VALUES (?, ?, ?, ?, ?, ?)",
        [imgPath, tool_name, stack_type_id, created_at, updated_at, stt]
      );

      console.log("Item creation successful for tool name:", tool_name);

      res.json({
        success: true,
        message: "Stack tool created successfully",
        toolId: result.insertId,
      });
    } catch (error) {
      console.error("Item creation error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
];

const stacktoolGetAll = [
  async (req, res) => {
    try {
      const [results] = await pool.query(`
            SELECT * FROM 
              our_stack_tool ost
            JOIN 
              stack_type st ON ost.stack_type_id = st.stack_type_id
            WHERE 
              ost.stt = 1
          `);

      const modifiedResults = results.map((item) => ({
        ...item,
        img: item.img
          ? `${req.protocol}://${req.get("host")}/uploads/${item.img
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

const stacktoolGetOne = [
  async (req, res) => {
    const { id } = req.params; // Extract the 'id' from the request parameters

    try {
      // Use parameterized query to prevent SQL injection
      const [results] = await pool.query(
        "SELECT * FROM our_stack_tool WHERE our_st_id = ? AND stt = 1",
        [id]
      );

      if (results.length > 0) {
        const item = results[0];
        const modifiedStackTool = {
          ...item,
          img: item.img
            ? `${req.protocol}://${req.get("host")}/uploads/${item.img
                .split("/")
                .pop()
                .split("\\")
                .pop()}`
            : null,
        };

        res.status(200).json(modifiedStackTool); // Send the modified stack tool as a response
      } else {
        res.status(404).json({ message: "Item not found" }); // If no stack tool is found, return 404
      }
    } catch (error) {
      console.error("Error fetching item by ID:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve record", details: error.message });
    }
  },
];

const stacktoolUpdate = [
  upload.single("img"),
  async (req, res) => {
    try {
      const { id, tool_name, stack_type_id } = req.body;
      console.log("Item update attempt for tool ID:", id);

      if (!id || !tool_name || !stack_type_id) {
        return res.status(400).json({
          success: false,
          message: "Tool ID, name, and stack type are required",
        });
      }

      // Get current tool info to check existing image
      const [currentTool] = await pool.query(
        "SELECT img FROM our_stack_tool WHERE our_st_id = ?",
        [id]
      );

      if (currentTool.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Stack tool not found",
        });
      }

      let imgPath = currentTool[0].img;

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

      const updated_at = new Date();

      // Update the stack tool in the database
      const [result] = await pool.execute(
        "UPDATE our_stack_tool SET img = ?, tool_name = ?, stack_type_id = ?, updated_at = ? WHERE our_st_id = ?",
        [imgPath, tool_name, stack_type_id, updated_at, id]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to update stack tool",
        });
      }

      console.log("Item update successful for tool ID:", id);

      res.json({
        success: true,
        message: "Stack tool updated successfully",
        toolId: id,
      });
    } catch (error) {
      console.error("Item update error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        details: error.message,
      });
    }
  },
];

const stacktoolDelete = [
  async (req, res) => {
    const { id } = req.params;

    try {
      // Get the image path for the given partner ID
      const [rows] = await pool.query(
        "SELECT img FROM our_stack_tool WHERE our_st_id = ?",
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
        "UPDATE our_stack_tool SET stt = 0, updated_at = CURRENT_TIMESTAMP WHERE our_st_id = ?",
        [id]
      );

      if (result.affectedRows > 0) {
        res.status(200).json({
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
  stacktoolCreate,
  stacktoolGetAll,
  stacktoolGetOne,
  stacktoolUpdate,
  stacktoolDelete,
};
