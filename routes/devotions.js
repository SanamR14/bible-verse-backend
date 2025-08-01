const express = require('express');
const router = express.Router();
const controller = require('../controllers/devotionsController');

router.get('/', controller.getAllDevotions);
router.post('/', controller.createDevotions);
router.put('/:id', controller.updateDevotions);
router.delete('/:id', controller.deleteDevotions);

module.exports = router;
