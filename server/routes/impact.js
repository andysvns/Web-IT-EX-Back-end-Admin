var express = require("express");
var router = express.Router();

const {
  impactCreate,
  impactGetAll,
  impactGetOne,
  impactUpdate,
  impactDelete,
} = require("../controllers/impact_controller");

router.post("/create", impactCreate);
router.get("/getall", impactGetAll);
router.get("/view/:id", impactGetOne);
router.put("/update/:id", impactUpdate);
router.put("/del/:id", impactDelete);


module.exports = router;
