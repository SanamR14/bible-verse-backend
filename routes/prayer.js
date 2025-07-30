const express = require('express');
const router = express.Router();
require('dotenv').config();

const {
  getAllPrayerRequest,
  getPrayerRequestByUser,
  deletePrayerRequest,
  addPrayerRequest
} = require('../controllers/prayerController');

router.get('/allPrayers', getAllPrayerRequest);
router.get('/:userId', getPrayerRequestByUser);
router.delete('/:userId/:prayerid', deletePrayerRequest);
router.post('/prayerReq', addPrayerRequest);

module.exports = router;
