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

// ✅ Create storage with auto folder creation
const createStorage = (folderName = "uploads") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, `../${folderName}`);
      // Ensure folder exists
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const sanitized = file.originalname.replace(/\s+/g, "_");
      cb(null, `${Date.now()}-${sanitized}`);
    },
  });

// ✅ Uploader
const makeUploader = (folderName = "uploads") => {
  const storage = createStorage(folderName);

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp/;
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.test(ext)) cb(null, true);
      else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
    },
  });
};

// ✅ Handle upload errors
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

// ✅ Delete old file safely
const deleteOldFile = (filePath) => {
  if (!filePath) return;
  const cleanPath = filePath.startsWith("/uploads/")
    ? filePath.replace("/uploads/", "")
    : filePath;

  const absolutePath = path.join(__dirname, "../uploads", cleanPath);

  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.warn("⚠️ Failed to delete old image:", err.message);
    }
  });
};

module.exports = {
  upload: makeUploader("uploads"),
  makeUploader,
  handleUpload,
  deleteOldFile,
};
