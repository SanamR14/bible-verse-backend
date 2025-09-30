const jwt = require("jsonwebtoken");
const pool = require("../db");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "TokenExpired" }); // 🔑 special case
      }
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    console.log(user);
    next();
  });
};

module.exports = authMiddleware;
