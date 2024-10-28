var express = require("express");
var router = express.Router();
// const { authenticateToken } = require('../controllers/middleware');
const {
  userCreate,
  userGetAll,
  userResetPassword,
  // resetPassword,
  //   listtaskGetOne,
  //   listtaskUpdate,
  //   listtaskDelete,
} = require("../controllers/user_con");

router.post("/create", userCreate);
router.get("/getall", userGetAll);
router.post("/reset-password", userResetPassword);
// router.post('/reset-password', resetPassword);
// router.get("/view/:id", listtaskGetOne);
// router.put("/update/:id", listtaskUpdate);
// router.put("/del/:id", listtaskDelete);



//List Task

module.exports = router;
