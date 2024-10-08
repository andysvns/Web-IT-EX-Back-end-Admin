var express = require("express");
var router = express.Router();

const { login, register } = require("../controllers/authen_controller");

router.post("/login", login);
router.post("/register", register);

module.exports = router;
