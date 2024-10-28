var express = require("express");
var router = express.Router();

const {
  socialUrlCreate,
  socialUrlGetAll,
  socialUrlGetOne,
  socialUrlUpdate,
  socialUrlDelete,
} = require("../controllers/socialurl_con");

router.post("/create", socialUrlCreate);
router.get("/getall", socialUrlGetAll);
router.get("/view/:id", socialUrlGetOne);
router.put("/update/:id", socialUrlUpdate);
router.put("/del/:id", socialUrlDelete);

module.exports = router;
