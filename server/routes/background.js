var express = require("express");
var router = express.Router();

const {
  backgroundGetFirst,
  backgroundUpdate,
} = require("../controllers/background_con");

router.get("/getfirst", backgroundGetFirst);
router.put("/update/:id", backgroundUpdate);

module.exports = router;
