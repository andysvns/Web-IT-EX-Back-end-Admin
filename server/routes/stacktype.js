var express = require("express");
var router = express.Router();

const {
    stacktypeCreate,
    stacktypeGetAll,
    stacktypeGetOne,
    stacktypeUpdate,
    stacktypeDelete,
  } = require("../controllers/stacktype_con");
  
  router.post("/create", stacktypeCreate);
  router.get("/getall", stacktypeGetAll);
  router.get("/view/:id", stacktypeGetOne);
  router.put("/update/:id", stacktypeUpdate);
  router.put("/del/:id", stacktypeDelete);
  
  //List Task
  
  module.exports = router;
  