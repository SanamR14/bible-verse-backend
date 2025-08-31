const express = require('express');
const router = express.Router();
const { getHomeData } = require('../controllers/homeController');

const authMiddleware = require("./middleware/auth");

router.get('/',authMiddleware, getHomeData);

module.exports = router;
