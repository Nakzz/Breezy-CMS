var express = require('express');
var router = express.Router();

const userController = require("./controllers/userController");
const eventController = require("./controllers/eventcontroller");

// event routes requests

router.post('/validateBreezer', userController.validateBreezer);




module.exports = router;