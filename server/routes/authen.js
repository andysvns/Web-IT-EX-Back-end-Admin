var express = require("express");
var router = express.Router();
const { login,regis } = require("../controllers/authen_controller");
/* GET users listing. */
router.post("/login", login);
// router.post("/register", regis);

module.exports = router;
