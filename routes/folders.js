import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAllFolders,
  createFolder,
  getFolderFiles,
  uploadFile,
} from "../controllers/folderController.js";

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

export default router;
