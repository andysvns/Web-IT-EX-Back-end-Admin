var express = require("express");
var router = express.Router();

const {
  stacktoolCreate,
  stacktoolGetAll,
  stacktoolGetOne,
  stacktoolUpdate,
  stacktoolDelete,
} = require("../controllers/stacktool_con");

router.post("/create", stacktoolCreate);
router.get("/getall", stacktoolGetAll);
router.get("/view/:id", stacktoolGetOne);
router.put("/update/:id", stacktoolUpdate);
router.put("/del/:id", stacktoolDelete);

module.exports = router;
