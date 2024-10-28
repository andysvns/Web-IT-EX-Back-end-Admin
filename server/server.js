const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { pool } = require("./db");

const authenRouter = require("./routes/authen");
const productRoutes = require("./routes/ourproduct");
const partnerRoutes = require("./routes/ourpartner");
const listtaskRoutes = require("./routes/listtask");
const impactRoutes = require("./routes/impact");
const introRoutes = require("./routes/intro");
const memberRoutes = require("./routes/member");
const backgroundRoutes = require("./routes/background");
const homeaboutusRoutes = require("./routes/homeaboutus");
const stacktoolRoutes = require("./routes/stacktool");
const stacktypeRoutes = require("./routes/stacktype");
const socialtypeRoutes = require("./routes/socialtype");
const socialurlRoutes = require("./routes/socialurl");
const contactRoutes = require("./routes/contact");
const userRoutes = require("./routes/userspath");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/authen", authenRouter);
app.use("/api/products", productRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/listtask", listtaskRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/intro", introRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/background", backgroundRoutes);
app.use("/api/homeabout", homeaboutusRoutes);
app.use("/api/stacktool", stacktoolRoutes);
app.use("/api/stacktype", stacktypeRoutes);
app.use("/api/socialtype", socialtypeRoutes);
app.use("/api/socialurl", socialurlRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes);

// Database connection

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
