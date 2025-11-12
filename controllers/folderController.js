import pool from "../db.js";
import fs from "fs";
import path from "path";

/** Helper */
const isAdmin = (email) => email?.endsWith("@admin.fyi.com");

/** ✅ Get all folders */
export const getAllFolders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM folders ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("getAllFolders:", err);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
};

/** ✅ Create a folder (Admin only) */
export const createFolder = async (req, res) => {
  try {
    const { name, userEmail } = req.body;
    if (!isAdmin(userEmail)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const result = await pool.query(
      "INSERT INTO folders (name, created_by) VALUES ($1, $2) RETURNING *",
      [name, userEmail]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("createFolder:", err);
    res.status(500).json({ error: "Failed to create folder" });
  }
};

/** ✅ Get files in a folder */
export const getFolderFiles = async (req, res) => {
  const { folderId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM files WHERE folder_id=$1 ORDER BY uploaded_at DESC",
      [folderId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getFolderFiles:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

/** ✅ Upload file (Admin only) */
export const uploadFile = async (req, res) => {
  const { folderId } = req.params;
  const { userEmail } = req.body;

  if (!isAdmin(userEmail)) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const file = req.file;
    const fileUrl = `${req.protocol}://${req.get("host")}/${file.path}`;

    const query = `
      INSERT INTO files (folder_id, file_name, file_url, mime_type, size, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      folderId,
      file.originalname,
      fileUrl,
      file.mimetype,
      file.size,
      userEmail,
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("uploadFile:", err);
    res.status(500).json({ error: "File upload failed" });
  }
};
