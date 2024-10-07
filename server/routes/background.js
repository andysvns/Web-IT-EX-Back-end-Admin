var express = require("express");
var router = express.Router();

const {
  backgroundGetFirst,
  backgroundGetOne,
  backgroundUpdate,
} = require("../controllers/background_con");

router.get("/getfirst", backgroundGetFirst);
router.get("/view/:id", backgroundGetOne);
router.put("/update/:id", backgroundUpdate);

module.exports = router;
