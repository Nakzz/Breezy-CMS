var express = require('express');
var router = express.Router();

const userController = require("./controllers/userController");
const eventController = require("./controllers/eventcontroller");

// Management routes requests
router.get('/', function (req, res) {
    res.send('Management main page');
})

router.post('/validateBreezer', userController.validateBreezer);


router.post('/rechargeBreezer', userController.addBalanceToBreezer);


module.exports = router;