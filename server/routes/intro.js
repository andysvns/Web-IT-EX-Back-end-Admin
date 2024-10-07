var express = require("express");
var router = express.Router();

const {
  introGetFirst,
  introGetOne,
  introUpdate,
} = require("../controllers/intro_con");

router.get("/getfirst", introGetFirst);
router.get("/view/:id", introGetOne);
router.put("/update/:id", introUpdate);

module.exports = router;
