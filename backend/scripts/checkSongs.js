require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { getDatabase } = require('../src/config/mongo');

(async () => {
  try {
    const db = await getDatabase();
    const col = db.collection('songs');

    const total = await col.countDocuments();
    const missingWaveform = await col.find({ $or: [ { waveformStats: { $exists: false } }, { 'waveformStats.rmsEnergy': { $exists: false } } ] }).limit(50).toArray();
    const hasFeaturesField = await col.find({ features: { $exists: true } }).limit(50).toArray();

    console.log('Total songs:', total);
    console.log('Songs missing waveformStats or rmsEnergy (sample up to 50):', missingWaveform.length);
    missingWaveform.slice(0,10).forEach(s => console.log(' -', s.id || s._id, s.title || s.filename));

    console.log('\nSongs that still have legacy "features" field (sample up to 50):', hasFeaturesField.length);
    hasFeaturesField.slice(0,10).forEach(s => console.log(' -', s.id || s._id, s.title || s.filename));

    process.exit(0);
  } catch (err) {
    console.error('Error checking songs:', err);
    process.exit(2);
  }
})();
