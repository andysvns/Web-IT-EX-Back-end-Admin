var express = require("express");
var router = express.Router();

const {
  contactGetall,
  contactGetone,
  contactUpdate,
} = require("../controllers/contact_con");

router.get("/getall", contactGetall);
router.get("/view/:id", contactGetone);
router.put("/update/:id", contactUpdate);

module.exports = router;
