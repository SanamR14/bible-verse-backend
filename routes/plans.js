const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');

router.get('/', plansController.getAllPlans);
router.post('/', plansController.createPlan);
router.put('/:id', plansController.updatePlan);
router.delete('/:id', plansController.deletePlan);

module.exports = router;
