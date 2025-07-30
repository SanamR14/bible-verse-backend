const express = require('express');
const router = express.Router();
require('dotenv').config();

const {
  getUsers,
  registerUser,
  deleteUser,
  loginUser
} = require('../controllers/userController');

router.get('/', getUsers);
router.post('/signup', registerUser);
router.delete('/:id', deleteUser);
router.post('/login', loginUser);

module.exports = router;
