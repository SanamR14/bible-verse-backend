const express = require("express");
const router = express.Router();
require("dotenv").config();

const {
  getUsers,
  registerUser,
  loginUser,
  verifyEmail,
} = require("../controllers/userController");

router.get("/", getUsers);
router.post("/signup", registerUser);
// router.delete("/:id", deleteUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);

module.exports = router;
