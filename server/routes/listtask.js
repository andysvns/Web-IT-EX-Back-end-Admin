var express = require("express");
var router = express.Router();

const {
  listtaskCreate,
  listtaskGetAll,
  listtaskGetOne,
  listtaskUpdate,
  listtaskDelete,
} = require("../controllers/listtask_con");

router.post("/create", listtaskCreate);
router.get("/getall", listtaskGetAll);
router.get("/view/:id", listtaskGetOne);
router.put("/update/:id", listtaskUpdate);
router.put("/del/:id", listtaskDelete);

//List Task

module.exports = router;
