// const multer = require("multer");
// const path = require("path");

// // Multer storage config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads")); // ✅ absolute path
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
//   fileFilter: (req, file, cb) => {
//     const allowed = /jpeg|jpg|png|webp/;
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowed.test(ext)) cb(null, true);
//     else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
//   },
// });

// // Middleware wrapper to handle errors and send API-friendly responses
// const handleUpload = (uploadFn) => (req, res, next) => {
//   uploadFn(req, res, (err) => {
//     if (err) {
//       if (err.code === "LIMIT_FILE_SIZE") {
//         return res.status(400).json({
//           isSuccess: false,
//           status: 400,
//           message: "File too large. Maximum allowed size is 5 MB.",
//           data: null,
//         });
//       }
//       return res.status(400).json({
//         isSuccess: false,
//         status: 400,
//         message: err.message,
//         data: null,
//       });
//     }
//     next();
//   });
// };

// module.exports = { upload, handleUpload };
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Dynamic storage creation helper
 * @param {string} folderName - upload folder name (default: 'uploads')
 */
const createStorage = (folderName = "uploads") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, `../${folderName}`);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const sanitized = file.originalname.replace(/\s+/g, "_");
      cb(null, `${Date.now()}-${sanitized}`);
    },
  });

/**
 * Generic upload middleware generator
 * @param {string} folderName
 */
const makeUploader = (folderName = "uploads") => {
  const storage = createStorage(folderName);

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp/;
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.test(ext)) cb(null, true);
      else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
    },
  });
};

/**
 * Middleware wrapper for clean API error handling
 */
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          isSuccess: false,
          status: 400,
          message: "File too large. Maximum allowed size is 5 MB.",
          data: null,
        });
      }
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: err.message,
        data: null,
      });
    }
    next();
  });
};

/**
 * Helper to safely delete an old uploaded file
 * @param {string} filename - e.g., '1738942342342-food.png'
 * @param {string} folderName - e.g., 'uploads'
 */
const deleteOldFile = (filename, folderName = "uploads") => {
  if (!filename) return;
  const filePath = path.join(__dirname, `../${folderName}`, filename);
  fs.unlink(filePath, (err) => {
    if (err) console.warn("⚠️ Failed to delete old image:", err.message);
  });
};

module.exports = {
  upload: makeUploader("uploads"), // default
  makeUploader,
  handleUpload,
  deleteOldFile,
};
