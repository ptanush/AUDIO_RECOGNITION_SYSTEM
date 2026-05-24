import os
import sys
import json

# Allow imports from parent model/ directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from faster_whisper import WhisperModel
from config import DATASET_FOLDER, WHISPER_MODEL_SIZE, LYRICS_DB_PATH

print(f"Loading Whisper model: {WHISPER_MODEL_SIZE}")
model = WhisperModel(WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")

database = {}
SUPPORTED_FORMATS = (".mp3", ".wav", ".m4a", ".flac", ".ogg", ".webm", ".mp4")
total_files = 0
processed_count = 0
error_count = 0

print(f"Scanning dataset folder: {DATASET_FOLDER}\n")

for root, dirs, files in os.walk(DATASET_FOLDER):
    for file in files:
        if file.endswith(SUPPORTED_FORMATS):
            total_files += 1
            path = os.path.join(root, file)
            song_name = os.path.splitext(file)[0]

            print(f"[{processed_count + error_count + 1}/{total_files}] Processing: {song_name} ({file})")

            try:
                segments, _ = model.transcribe(path)
                extracted_text = " ".join(seg.text for seg in segments)

                relative_path = os.path.relpath(path, DATASET_FOLDER)
                db_key = os.path.splitext(relative_path)[0].replace("\\", "/")

                database[db_key] = extracted_text
                processed_count += 1
                print(f"  ✓ Done: {db_key}")

            except Exception as e:
                error_count += 1
                print(f"  ✗ Error: {str(e)}")

with open(LYRICS_DB_PATH, "w", encoding="utf-8") as f:
    json.dump(database, f, indent=4, ensure_ascii=False)

print(f"\n{'='*60}")
print(f"Lyrics database generated successfully!")
print(f"Location: {LYRICS_DB_PATH}")
print(f"Total files found: {total_files}")
print(f"Successfully processed: {processed_count}")
print(f"Errors: {error_count}")
print(f"Songs in database: {len(database)}")
print(f"{'='*60}")
