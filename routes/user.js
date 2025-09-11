const express = require("express");
const router = express.Router();
require("dotenv").config();

const {
  getUsers,
  getUserById,
  registerUser,
  deleteUser,
  loginUser,
  refreshToken,
  logoutUser,
  updateUserPrivacy,
  // verifyEmail,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUserById);
router.delete("/:id", authMiddleware, deleteUser);

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.put("/users/:id/privacy", updateUserPrivacy);
// router.get("/verify-email", verifyEmail);

module.exports = router;
