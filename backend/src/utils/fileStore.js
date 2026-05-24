const fs = require('fs');
const path = require('path');

const songDbPath = path.join(__dirname, '..', '..', '..', 'data', 'song-db.json');

const ensureUploadDirectories = () => {
  const uploadsPath = path.join(__dirname, '..', '..', 'uploads');
  const dataFolder = path.dirname(songDbPath);

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }
  if (!fs.existsSync(songDbPath)) {
    fs.writeFileSync(songDbPath, JSON.stringify([]));
  }
};

const readSongDatabase = async () => {
  try {
    const raw = await fs.promises.readFile(songDbPath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    return [];
  }
};

const writeSongDatabase = async (songs) => {
  await fs.promises.writeFile(songDbPath, JSON.stringify(songs, null, 2), 'utf8');
};

module.exports = { ensureUploadDirectories, readSongDatabase, writeSongDatabase };
