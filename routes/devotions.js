const express = require('express');
const router = express.Router();
const controller = require('../controllers/plansWithDaysController');

router.get('/', controller.getAllPlansWithDays);
router.post('/', controller.createPlanWithDays);
router.put('/:id', controller.updatePlanWithDays);
router.delete('/:id', controller.deletePlanWithDays);

module.exports = router;
