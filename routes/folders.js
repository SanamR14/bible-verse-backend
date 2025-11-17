const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getAllFolders,
  createFolder,
  getFolderFiles,
  uploadFile,
  deleteFile,
  deleteFolder,
} = require("../controllers/folderController");

const router = express.Router();

// Ensure upload dir exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.get("/", getAllFolders);
router.post("/", createFolder);
router.get("/:folderId/files", getFolderFiles);
router.post("/:folderId/upload", upload.single("file"), uploadFile);
router.delete("/files/:fileId", deleteFile);
router.delete("/folders/:folderId", deleteFolder);

module.exports = router;
