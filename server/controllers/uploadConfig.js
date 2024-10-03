const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: "./uploads",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5000000 }, // 5MB limit
});

module.exports = upload;
