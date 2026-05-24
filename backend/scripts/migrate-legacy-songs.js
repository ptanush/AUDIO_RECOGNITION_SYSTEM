require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'mergeconflicts';

async function migrateLegacySongs() {
  let client;
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const songsCollection = db.collection('songs');

    // Find all documents with the legacy 'features' field
    const legacySongs = await songsCollection.find({ features: { $exists: true } }).toArray();
    console.log(`\n📊 Found ${legacySongs.length} legacy documents to migrate`);

    if (legacySongs.length === 0) {
      console.log('✓ No legacy documents found. Database is already normalized.');
      return;
    }

    let migratedCount = 0;
    const errors = [];

    for (const song of legacySongs) {
      try {
        const { features, ...restOfDoc } = song;
        
        // Extract nested fields and promote to top level
        const migratedDoc = {
          ...restOfDoc,
          waveformStats: features?.waveformStats || {},
          spectralFingerprint: features?.spectralFingerprint || {},
          anchorPoints: features?.anchorPoints || [],
          audioSignature: features?.audioSignature || {},
          metadata: features?.metadata || {},
        };

        // Update the document in place (remove features, add top-level fields)
        await songsCollection.updateOne(
          { _id: song._id },
          {
            $set: {
              waveformStats: migratedDoc.waveformStats,
              spectralFingerprint: migratedDoc.spectralFingerprint,
              anchorPoints: migratedDoc.anchorPoints,
              audioSignature: migratedDoc.audioSignature,
              metadata: migratedDoc.metadata,
            },
            $unset: { features: '' }, // Remove the nested features field
          }
        );

        migratedCount++;
        
        // Log progress every 100 songs
        if (migratedCount % 100 === 0) {
          console.log(`  ⏳ Migrated ${migratedCount}/${legacySongs.length} documents...`);
        }
      } catch (err) {
        errors.push({ songId: song._id, error: err.message });
        console.error(`  ✗ Error migrating song ${song._id}:`, err.message);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Successfully migrated: ${migratedCount}/${legacySongs.length} documents`);
    
    if (errors.length > 0) {
      console.log(`   - Failed: ${errors.length} documents`);
      console.log('\n❌ Errors:');
      errors.forEach(({ songId, error }) => {
        console.log(`     - ${songId}: ${error}`);
      });
    }

    // Verify: count remaining legacy documents
    const remainingLegacy = await songsCollection.countDocuments({ features: { $exists: true } });
    console.log(`\n🔍 Verification: ${remainingLegacy} legacy documents remaining`);

    if (remainingLegacy === 0) {
      console.log('✓ All legacy documents have been successfully normalized!');
    } else {
      console.log('⚠️  Warning: Some legacy documents may still exist.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✓ Database connection closed');
    }
  }
}

// Run migration
migrateLegacySongs();
