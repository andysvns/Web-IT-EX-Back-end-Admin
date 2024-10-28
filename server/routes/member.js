var express = require("express");
var router = express.Router();

const {
  MemberCreate,
  MemberGetAll,
  MemberGetOne,
  MemberUpdate,
  MemberDelete,
} = require("../controllers/member_Con");

router.post("/create", MemberCreate);
router.get("/getall", MemberGetAll);
router.get("/view/:id", MemberGetOne);
router.put("/update/:id", MemberUpdate);
router.put("/del/:id", MemberDelete);

module.exports = router;
