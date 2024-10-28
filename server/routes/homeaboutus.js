var express = require("express");
var router = express.Router();

const {
  HomeAboutUsGetFirst,
  HomeAboutUsGetOne,
  HomeAboutUsUpdate,
} = require("../controllers/homeaboutus");

router.get("/getfirst", HomeAboutUsGetFirst);
router.get("/view/:id", HomeAboutUsGetOne);
router.put("/update/:id", HomeAboutUsUpdate);

module.exports = router;
