var express = require("express");
var router = express.Router();

const {
  socialtypeCreate,
  socialtypeGetAll,
  socialtypeGetOne,
  socialtypeUpdate,
  socialtypeDelete,
} = require("../controllers/socialtype.con");

router.post("/create", socialtypeCreate);
router.get("/getall", socialtypeGetAll);
router.get("/view/:id", socialtypeGetOne);
  router.put("/update/:id", socialtypeUpdate);
  router.put("/del/:id", socialtypeDelete);

//List Task

module.exports = router;
