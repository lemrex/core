const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summary.controller');
const auth = require('../middleware/tenantResolver.js');
const tenantResolver = require('../middleware/tenantResolver');

router.use(auth, tenantResolver);
router.get('/', summaryController.getSummary);

module.exports = router;
