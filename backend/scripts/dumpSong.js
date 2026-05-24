require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { getDatabase } = require('../src/config/mongo');

(async () => {
  try {
    const db = await getDatabase();
    const col = db.collection('songs');
    const doc = await col.findOne({ features: { $exists: true } });
    console.log(JSON.stringify(doc, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
})();
