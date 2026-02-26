const express = require('express');
const returnController = require('./return.controller');
const { processReturnValidation } = require('./return.validation');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(processReturnValidation, returnController.processReturn)
    .get(returnController.getAllReturns);

router.get('/:id', returnController.getReturnById);

module.exports = router;
