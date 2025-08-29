const express = require("express");
const router = express.Router();
require("dotenv").config();

const {
  getUsers,
  registerUser,
  loginUser,
  verifyUser,
} = require("../controllers/userController");

router.get("/", getUsers);
router.post("/signup", registerUser);
// router.delete("/:id", deleteUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyUser);

module.exports = router;
