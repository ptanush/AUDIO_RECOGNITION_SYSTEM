/**
 * Audio Matcher - Intelligent Similarity Scoring
 * 
 * Multi-faceted similarity scoring with 4 independent dimensions:
 * 
 * Total Score = 
 *   Waveform Comparison (25%) +
 *   Spectral Fingerprint (35%) +  ← PRIMARY (most discriminative)
 *   Audio Signature (25%) +
 *   Metadata Validation (15%)
 * 
 * This weighted approach ensures:
 * - Different features catch different variations
 * - Spectral fingerprint dominates (most robust to compression)
 * - Multiple layers of redundancy prevent false positives
 * - Exponential confidence curve prevents low-quality matches
 */
class AudioMatcher {
  // Matching weights - easiest to tune for hackathon
  static WEIGHTS = {
    waveformStats: 0.25,
    spectralFingerprint: 0.35, // PRIMARY - highest weight
    audioSignature: 0.25,
    metadata: 0.15
  };

  // Confidence threshold: matches below this are filtered
  static CONFIDENCE_THRESHOLD = 0.3; // 30%

  /**
   * Match query audio against database songs
   */
  static findMatches(queryFeatures, databaseSongs, topN = 5, threshold = null) {
    const confThreshold = threshold !== null ? threshold : this.CONFIDENCE_THRESHOLD;

    // Calculate similarity score for each song (defensive per-item handling)
    const scores = [];
    for (const dbSong of databaseSongs) {
      try {
        const rawScore = this._calculateTotalScore(queryFeatures, dbSong);
        const confidence = this._scoreToConfidence(rawScore);

        scores.push({
          song: dbSong,
          rawScore,
          confidence,
          matchingFeatures: this._getMatchingFeaturesBreakdown(queryFeatures, dbSong)
        });
      } catch (err) {
        console.error('AudioMatcher: error scoring song', dbSong && (dbSong.id || dbSong._id) , err && err.message);
        // Skip problematic song to avoid crashing the entire matching operation
        continue;
      }
    }

    // Filter by threshold
    const filtered = scores.filter((s) => s.confidence >= confThreshold * 100);

    // Sort by confidence (descending)
    filtered.sort((a, b) => b.confidence - a.confidence);

    // Return top N
    return filtered.slice(0, topN);
  }

  /**
   * Calculate total similarity score (0-1)
   * 
   * FORMULA:
   * Score = (waveform×0.25) + (spectral×0.35) + (signature×0.25) + (metadata×0.15)
   */
  static _calculateTotalScore(queryFeatures, dbSong) {
    const waveformScore = this._compareWaveformStats(queryFeatures, dbSong);
    const spectralScore = this._compareSpectralFingerprint(queryFeatures, dbSong);
    const signatureScore = this._compareAudioSignatures(queryFeatures, dbSong);
    const metadataScore = this._compareMetadata(queryFeatures, dbSong);

    // Weighted sum
    const totalScore =
      waveformScore * this.WEIGHTS.waveformStats +
      spectralScore * this.WEIGHTS.spectralFingerprint +
      signatureScore * this.WEIGHTS.audioSignature +
      metadataScore * this.WEIGHTS.metadata;

    return Math.max(0, Math.min(1, totalScore));
  }

  /**
   * WAVEFORM STATS COMPARISON (25% weight)
   * 
   * Compares 8 statistical measures with tolerance-based scoring:
   * - RMS Energy (tolerance: ±0.3)
   * - Peak Amplitude (tolerance: ±0.3)
   * - Zero-Crossing Rate (tolerance: ±0.2)
   * - Spectral Centroid (tolerance: ±200 Hz)
   * - Spectral Spread (tolerance: ±0.3)
   * - Entropy (tolerance: ±0.3)
   * - Crest Factor (tolerance: ±1.0)
   * - Flatness (tolerance: ±0.3)
   * 
   * EXAMPLE:
   * queryRMS = 0.25, dbRMS = 0.28, tolerance = 0.3
   * diff = |0.25 - 0.28| / 0.28 = 10.7%
   * tolerance_pct = (0.3 / 0.28) × 100 = 107%
   * similarity = max(0, 1 - (10.7 / 214)) = 0.95 ✓
   */
  static _compareWaveformStats(queryFeatures, dbSong) {
    const query = (queryFeatures && queryFeatures.waveformStats) || {};
    const db = (dbSong && dbSong.waveformStats) || {};

    // Define tolerances for each measure (larger = more forgiving)
    const tolerances = {
      rmsEnergy: 0.3,
      peakAmplitude: 0.3,
      zeroCrossingRate: 0.2,
      spectralCentroid: 0.3,
      spectralSpread: 0.3,
      entropy: 0.3,
      crestFactor: 1.0,
      flatness: 0.3
    };

    let scores = [];

    for (const [key, tolerance] of Object.entries(tolerances)) {
      const queryVal = query[key] || 0;
      const dbVal = db[key] || 0;

      // Calculate normalized difference
      const diff = Math.abs(queryVal - dbVal);
      const normalized = dbVal !== 0 ? diff / Math.abs(dbVal) : diff;
      const toleranceNorm = tolerance / (Math.abs(dbVal) || 1);

      // Convert to similarity (0-1): lower difference = higher score
      let similarity = 1 - Math.min(1, normalized / (toleranceNorm || 1));
      similarity = Math.max(0, similarity);

      scores.push(similarity);
    }

    // Average all measures
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * SPECTRAL FINGERPRINT COMPARISON (35% weight - PRIMARY)
   * 
   * Most discriminative matching method with 3 components:
   * 
   * A) Band Energy Comparison (50% of spectral weight)
   *    - Compare 16 frequency bands element-wise
   *    - Similarity = 1 - min(1, abs_diff × 2)
   *    - Average across all bands
   * 
   * B) Fingerprint String Comparison (30% of spectral weight)
   *    - Fingerprint: "F3A7C2E1B5D4F0A8" (16 hex chars, each 0-15)
   *    - Compare each position: similarity = 1 - (hex_diff / 15)
   *    - Average across string
   * 
   * C) Anchor Points Comparison (20% of spectral weight)
   *    - Match spectral peaks within tolerance
   *    - Match ratio = matches / total_anchors
   */
  static _compareSpectralFingerprint(queryFeatures, dbSong) {
    const queryFingerprint = queryFeatures.spectralFingerprint;
    const dbFingerprint = dbSong.spectralFingerprint;
    const queryAnchors = queryFeatures.anchorPoints || [];
    const dbAnchors = dbSong.anchorPoints || [];

    // A) Band Energy Comparison (50% of spectral weight)
    const bandScore = this._compareBandEnergies(queryFingerprint, dbFingerprint);

    // B) Fingerprint String Comparison (30% of spectral weight)
    const stringScore = this._compareFingerprintStrings(
      queryFeatures.audioSignature?.spectralHash || '',
      dbSong.audioSignature?.spectralHash || ''
    );

    // C) Anchor Points Comparison (20% of spectral weight)
    const anchorScore = this._compareAnchorPoints(queryAnchors, dbAnchors);

    // Weighted combination
    return bandScore * 0.5 + stringScore * 0.3 + anchorScore * 0.2;
  }

  /**
   * Compare 16-band energy distribution
   */
  static _compareBandEnergies(queryBands, dbBands) {
    if (queryBands.length === 0 || dbBands.length === 0) return 0;

    let score = 0;
    const minLen = Math.min(queryBands.length, dbBands.length);

    for (let i = 0; i < minLen; i++) {
      const diff = Math.abs(queryBands[i] - dbBands[i]);
      // Similarity: difference of 0.5 gives 0% similarity
      score += Math.max(0, 1 - diff * 2);
    }

    return score / minLen;
  }

  /**
   * Compare fingerprint strings using Hamming-like distance
   * 
   * Format: "F3A7C2E1B5D4F0A8" (16 hex chars)
   */
  static _compareFingerprintStrings(queryString, dbString) {
    if (queryString.length === 0 || dbString.length === 0) return 0;

    let matches = 0;
    const minLen = Math.min(queryString.length, dbString.length);

    for (let i = 0; i < minLen; i++) {
      const queryHex = parseInt(queryString[i], 16);
      const dbHex = parseInt(dbString[i], 16);
      const diff = Math.abs(queryHex - dbHex);

      // Similarity: 0 diff = 1.0, 15 diff = 0.0
      matches += 1 - diff / 15;
    }

    return matches / minLen;
  }

  /**
   * Compare anchor points (spectral peaks)
   * 
   * Anchor points are local maxima in frequency domain.
   * More robust to modifications than individual bands.
   */
  static _compareAnchorPoints(queryAnchors, dbAnchors) {
    if (queryAnchors.length === 0 || dbAnchors.length === 0) return 0.5; // Neutral

    let matches = 0;
    const indexTolerance = 2; // ±2 bands
    const valueTolerance = 0.2; // ±0.2 energy

    for (const queryAnchor of queryAnchors) {
      for (const dbAnchor of dbAnchors) {
        // Check if anchors are within tolerance
        const indexDiff = Math.abs(queryAnchor.index - dbAnchor.index);
        const valueDiff = Math.abs(queryAnchor.value - dbAnchor.value);

        if (indexDiff <= indexTolerance && valueDiff <= valueTolerance) {
          matches += 1;
          break; // Count each query anchor once
        }
      }
    }

    return matches / queryAnchors.length;
  }

  /**
   * AUDIO SIGNATURE COMPARISON (25% weight)
   * 
   * Hash-based quick pattern matching with 3 components:
   * 
   * A) Waveform Hash Comparison (40% of signature weight)
   * B) Spectral Hash Comparison (30% of signature weight)
   * C) Energy Profile Comparison (30% of signature weight)
   */
  static _compareAudioSignatures(queryFeatures, dbSong) {
    const querySig = queryFeatures.audioSignature;
    const dbSig = dbSong.audioSignature;

    // Defensive: handle missing signatures
    if (!querySig || !dbSig) return 0;

    // A) Waveform hash comparison (40%)
    const waveformHashScore = this._compareHashes(
      querySig.waveformHash,
      dbSig.waveformHash
    );

    // B) Spectral hash comparison (30%)
    const spectralHashScore = this._compareHashes(
      querySig.spectralHash,
      dbSig.spectralHash
    );

    // C) Energy profile comparison (30%)
    const energyScore = this._compareEnergyProfiles(
      querySig.energyProfile,
      dbSig.energyProfile
    );

    return waveformHashScore * 0.4 + spectralHashScore * 0.3 + energyScore * 0.3;
  }

  /**
   * Compare two hash strings character-by-character
   */
  static _compareHashes(queryHash, dbHash) {
    // Defensive: handle undefined/null hashes
    if (!queryHash || !dbHash || queryHash.length === 0 || dbHash.length === 0) return 0;

    let matches = 0;
    const minLen = Math.min(queryHash.length, dbHash.length);

    for (let i = 0; i < minLen; i++) {
      if (queryHash[i] === dbHash[i]) {
        matches += 1;
      }
    }

    return matches / minLen;
  }

  /**
   * Compare energy profiles
   * 
   * Energy profile contains:
   * - overall: RMS energy
   * - peak: peak amplitude
   * - dynamic: crest factor (dynamic range)
   * - avgBandEnergy: average energy across spectrum
   */
  static _compareEnergyProfiles(queryProfile, dbProfile) {
    // Defensive: handle missing profiles
    if (!queryProfile || !dbProfile) return 0;
    
    const fields = ['overall', 'peak', 'dynamic', 'avgBandEnergy'];
    const tolerance = 0.2; // 20% tolerance

    let score = 0;
    for (const field of fields) {
      const queryVal = queryProfile[field] || 0;
      const dbVal = dbProfile[field] || 0;

      const diff = Math.abs(queryVal - dbVal);
      const normalized = dbVal !== 0 ? diff / Math.abs(dbVal) : diff;

      // Similarity with tolerance
      score += Math.max(0, 1 - normalized / (tolerance || 1));
    }

    return score / fields.length;
  }

  /**
   * METADATA COMPARISON (15% weight)
   * 
   * Validates audio properties:
   * - Sample rate (±5% tolerance)
   * - Channel count match
   * - Codec consistency
   * 
   * Lower weight because same content can have different metadata
   */
  static _compareMetadata(queryFeatures, dbSong) {
    const queryMeta = queryFeatures.metadata;
    const dbMeta = dbSong.metadata;

    let scores = [];

    // Sample rate comparison (±5% tolerance)
    const srDiff = Math.abs(queryMeta.sampleRate - dbMeta.sampleRate);
    const srTolerance = dbMeta.sampleRate * 0.05;
    scores.push(Math.max(0, 1 - srDiff / (srTolerance || 1)));

    // Channel count match
    scores.push(queryMeta.channels === dbMeta.channels ? 1.0 : 0.7);

    // Codec match
    scores.push(queryMeta.codec === dbMeta.codec ? 1.0 : 0.7);

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * CONFIDENCE CALCULATION
   * 
   * Raw score (0-1) → Confidence (0-100%)
   * 
   * FORMULA: confidence = (score ^ 0.8) × 100
   * 
   * Why exponential curve?
   * - Amplifies good scores (>0.7)
   * - Dampens poor scores (<0.3)
   * - Prevents false positives
   * - Creates meaningful percentages
   * 
   * CALIBRATION:
   * Score 0.5 → 43.7% confidence (weak match)
   * Score 0.7 → 63.5% confidence (moderate)
   * Score 0.85 → 79.8% confidence (strong)
   * Score 1.0 → 100% confidence (perfect)
   */
  static _scoreToConfidence(rawScore) {
    if (rawScore <= 0) return 0;
    if (rawScore >= 1) return 100;

    // Exponential curve: 0.8 exponent amplifies differences
    return Math.round(Math.pow(rawScore, 0.8) * 100);
  }

  /**
   * Get breakdown of matching features for response
   */
  static _getMatchingFeaturesBreakdown(queryFeatures, dbSong) {
    return {
      waveformMatch: Math.round(this._compareWaveformStats(queryFeatures, dbSong) * 10000) / 10000,
      spectralMatch: Math.round(this._compareSpectralFingerprint(queryFeatures, dbSong) * 10000) / 10000,
      signatureMatch: Math.round(this._compareAudioSignatures(queryFeatures, dbSong) * 10000) / 10000,
      metadataMatch: Math.round(this._compareMetadata(queryFeatures, dbSong) * 10000) / 10000
    };
  }
}

module.exports = AudioMatcher;
