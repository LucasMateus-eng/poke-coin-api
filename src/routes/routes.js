const express = require('express');
const router = express.Router();
const userControler = require('../app/controllers/UserController');

const userAlreadyExists = require('../middlewares/userAlreadyExists');
const checkToken = require('../middlewares/checkToken');

router.get('/user', checkToken, userControler.getUser);
router.get('/balance', checkToken, userControler.getBalance);
router.get('/operations', checkToken, userControler.getAllOperations);
router.get('/wallet', checkToken, userControler.getWallet);
router.get('/wallet/value', checkToken, userControler.getWalletValue);

router.post('/auth/register', userAlreadyExists, userControler.createUser);
router.post('/auth/login', userControler.loginUser);
router.post('/statement', checkToken, userControler.makeDeposit);
router.post('/acquisition', checkToken, userControler.makeAcquisition);
router.post('/sale', checkToken, userControler.makeASale);

module.exports = router;
