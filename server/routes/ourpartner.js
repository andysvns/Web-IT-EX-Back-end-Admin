var express = require("express");
var router = express.Router();

const {
  partnerCreate,
  partnerGetAll,
  partnerGetOne,
  partnerUpdate,
  partnerDelete,
} = require("../controllers/ourpartner_con");

router.post("/create", partnerCreate);
router.get("/getall", partnerGetAll);
router.get("/view/:id", partnerGetOne);
router.put("/update/:id", partnerUpdate);
router.put("/del/:id", partnerDelete);

module.exports = router;
