"""
Configuration settings for the Audio Lyrics Matcher.
Centralizes all tunable parameters in one place.
"""

import os

# ── Whisper Model Settings ──────────────────────────────────────────
# Options: "tiny", "base", "small", "medium", "large"
# "base" is the best balance of speed vs accuracy for a hackathon.
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")

# ── Matching Thresholds ─────────────────────────────────────────────
# Minimum fuzzy-match score (0-100) to consider a song a valid match.
MATCH_THRESHOLD = int(os.getenv("MATCH_THRESHOLD", "50"))

# ── File Paths ──────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LYRICS_DB_PATH = os.path.join(BASE_DIR, "lyrics_db.json")
DATASET_FOLDER = os.path.join(os.path.dirname(BASE_DIR), "data")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ── Flask Settings ──────────────────────────────────────────────────
FLASK_HOST = "0.0.0.0"
FLASK_PORT = int(os.getenv("FLASK_PORT", "5001"))
FLASK_DEBUG = True

# ── Supported Audio Extensions ──────────────────────────────────────
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm", ".mp4"}
