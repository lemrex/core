const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const auth = require('../middleware/tenantResolver.js');
const tenantResolver = require('../middleware/tenantResolver');

router.use(auth, tenantResolver);

router.post('/credit', transactionController.credit);
router.post('/debit', transactionController.debit);
router.get('/recent', transactionController.getRecentTransactions);
router.get('/:id', transactionController.getTransactionById);



module.exports = router;
