const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller.js');
const auth = require('../middleware/tenantResolver.js');
const tenantResolver = require('../middleware/tenantResolver.js');

router.use(auth, tenantResolver);
router.post('/', accountController.createAccount);
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);


module.exports = router;



