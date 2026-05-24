const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadFolder = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destination = uploadFolder;
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9\.\-_]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const audioFilter = function (req, file, cb) {
  const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only audio files are allowed (.mp3, .wav, .ogg, .m4a, .flac)'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: audioFilter, limits: { fileSize: 30 * 1024 * 1024 } });

module.exports = { upload };
