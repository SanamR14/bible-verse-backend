const pool = require("../db");

/** Helper */
// const isAdmin = (email) => email?.endsWith("@admin.fyi.com");

/** ✅ Get all folders */
exports.getAllFolders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM folders ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("getAllFolders:", err);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
};

/** ✅ Create a folder (Admin only) */
exports.createFolder = async (req, res) => {
  try {
    const { name, userEmail, room_name, church } = req.body;
    // if (!isAdmin(userEmail)) {
    //   return res.status(403).json({ error: "Not authorized" });
    // }
    const result = await pool.query(
      "INSERT INTO folders (name, created_by, room_name, church) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, userEmail, room_name, church]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("createFolder:", err);
    res.status(500).json({ error: "Failed to create folder" });
  }
};

/** ✅ Get files in a folder */
exports.getFolderFiles = async (req, res) => {
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

exports.deleteFolder = async (req, res) => {
  const { folderId } = req.params;

  try {
    // Delete all files under this folder
    await pool.query("DELETE FROM files WHERE folder_id=$1", [folderId]);

    // Delete the folder itself
    const result = await pool.query(
      "DELETE FROM folders WHERE id=$1 RETURNING *",
      [folderId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Folder not found" });

    res.json({ success: true, message: "Folder deleted" });
  } catch (err) {
    console.error("deleteFolder:", err);
    res.status(500).json({ error: "Failed to delete folder" });
  }
};

exports.uploadFile = async (req, res) => {
  const { folderId } = req.params;
  const { userEmail } = req.body;

  //   if (!isAdmin(userEmail)) {
  //     if (req.file) fs.unlinkSync(req.file.path);
  //     return res.status(403).json({ error: "Not authorized" });
  //   }

  try {
    const file = req.file;
    const fileUrl = `${req.protocol}://${req.get("host")}/${file.path}`;

    const query = `
      INSERT INTO files (folder_id, file_name, file_url, mime_type, size, uploaded_by, room_name, church)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      folderId,
      file.originalname,
      fileUrl,
      file.mimetype,
      file.size,
      userEmail,
      room_name,
      church
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("uploadFile:", err);
    res.status(500).json({ error: "File upload failed" });
  }
};

exports.deleteFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    // Get file info first
    const fileResult = await pool.query(
      "SELECT file_url FROM files WHERE id=$1",
      [fileId]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileUrl = fileResult.rows[0].file_url;

    // Extract local file path (remove domain part)
    const localPath = fileUrl.replace(`${req.protocol}://${req.get("host")}/`, "");

    // Delete DB entry
    await pool.query("DELETE FROM files WHERE id=$1", [fileId]);

    // Remove local file safely
    fs.unlink(localPath, (err) => {
      if (err) console.log("File not found on disk:", localPath);
    });

    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    console.error("deleteFile:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
};
