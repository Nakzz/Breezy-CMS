var express = require('express');
var router = express.Router();

const userController = require("./controllers/userController");
const eventController = require("./controllers/eventcontroller");

// Frontend routes requests
router.get('/', function (req, res) {
    res.send('Frontend API root route');
})

router.post('/registerUser', userController.registerUser);

//router.post('/validateBreezer', userController.validateBreezer);


//router.post('/rechargeBreezer', userController.addBalanceToBreezer);


module.exports = router;

