const fs = require('fs');
const path = require('path');
const AudioFeatureExtractor = require('../src/utils/audioFeatureExtractor');

(async () => {
  try {
    // Generate small WAV buffer
    const sampleRate = 22050;
    const durationSeconds = 2;
    const frequency = 440;
    const amplitude = 8000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const numSamples = sampleRate * durationSeconds;
    const dataSize = numSamples * numChannels * (bitsPerSample / 8);
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    for (let i = 0; i < numSamples; i++) {
      const sample = Math.round(Math.sin((2 * Math.PI * frequency * i) / sampleRate) * amplitude);
      buffer.writeInt16LE(sample, 44 + i * 2);
    }

    const wavPath = path.join(__dirname, `extract-test-${Date.now()}.wav`);
    fs.writeFileSync(wavPath, buffer);
    console.log('WAV generated:', wavPath);

    const features = await AudioFeatureExtractor.extractFeatures(wavPath);
    console.log('Extracted features:', JSON.stringify(features, null, 2));

    fs.unlinkSync(wavPath);
    process.exit(0);
  } catch (err) {
    console.error('Extraction error:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
})();
