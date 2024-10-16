var express = require("express");
var router = express.Router();

const { login,authenticateToken,getUserDetails } = require("../controllers/authen_controller");

router.post("/login", login);

router.get('/user', authenticateToken, getUserDetails);
module.exports = router;
