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
router.get('/:userid', getPrayerRequestByUser);
router.delete('/:userid/:prayerid', deletePrayerRequest);
router.post('/prayerReq', addPrayerRequest);

module.exports = router;
