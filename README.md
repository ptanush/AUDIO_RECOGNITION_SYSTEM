# AUDIO RECOGNITION SYSTEM

A full-stack audio identification system that recognises songs from uploaded or recorded audio clips using multi-dimensional audio fingerprinting and lyrics-based fuzzy matching.

---

## Table of Contents

1. [Architecture & Design](#architecture--design)
2. [Libraries & Tools](#libraries--tools)
3. [Local Setup](#local-setup)
4. [Running a Sample Audio](#running-a-sample-audio)

---

## Architecture & Design

The system follows **MVC (Model-View-Controller)** design across all three layers.

### System Overview

```
Browser (React · port 5173)
        │
        │  REST API (JWT auth)
        ▼
Node.js Backend (Express · port 5000)
        │                    │
        │                    ▼
        │             MongoDB (song database)
        │
        │  (optional lyrics match)
        ▼
Python Model Service (Flask · port 5001)
        │
        ├── Whisper  →  speech-to-text transcription
        └── RapidFuzz → fuzzy lyrics matching
```

### MVC Breakdown

**Backend (`backend/src/`)**

| Layer | Directory | Responsibility |
|---|---|---|
| Model | `models/` | `Song.js`, `User.js` — MongoDB schema & queries |
| Controller | `controllers/` | `songController.js`, `authController.js` — request handling & business logic |
| View | JSON responses | Shaped and returned by controllers |
| Services | `services/` | `audioFeatureExtractor.js`, `audioMatcher.js`, `audioProcessingPipeline.js` — audio processing |
| Middleware | `middleware/` | JWT auth, audio validation, rate limiting, error handling |
| Routes | `routes/` | `authRoutes.js`, `songRoutes.js` |

**Python Model Service (`model/`)**

| Layer | Directory | Responsibility |
|---|---|---|
| Model | `models/` | `lyrics_model.py` — lyrics DB load/save |
| Controller | `controllers/` | `audio_controller.py` — Flask Blueprint with all endpoints |
| Service | `services/` | `matcher_service.py` — Whisper transcription + RapidFuzz matching |
| Entry point | `api.py` | Creates Flask app and registers blueprint |

**Frontend (`frontend/audio_tracker/src/`)**

| Layer | Directory | Responsibility |
|---|---|---|
| Model | `models/` | `api.js` — API client with JWT injection |
| View | `views/` | `pages/` (full pages) + `components/` (reusable UI) |
| Controller | `controllers/hooks/` | Custom React hooks (state & event logic) |

### Audio Matching Pipeline (Node.js)

Uploaded audio is processed through 4 stages and matched across 4 dimensions:

```
Stage 1: Waveform extraction     (50–100ms)
Stage 2: Spectral fingerprinting (20–50ms)
Stage 3: Database comparison     (30–80ms)
Stage 4: Similarity ranking      (10–30ms)

Scoring weights:
  Spectral fingerprint  35%
  Waveform statistics   25%
  Audio signature       25%
  Metadata consistency  15%

Confidence = score^0.8 × 100  →  range 0–100%
```

### Lyrics Matching Pipeline (Python)

```
Audio file
    └── Whisper (faster-whisper) → transcribed text
            └── RapidFuzz partial_ratio → compared against lyrics_db.json
                    └── Best match + confidence score returned
```

---

## Libraries & Tools

### Runtime Versions

| Tool | Version |
|---|---|
| Node.js | v26.0.0 |
| npm | 11.12.1 |
| Python (model service) | 3.12.13 (via pyenv) |
| MongoDB | 8.2.9 |
| FFmpeg | 8.1.1 |

### Backend — Node.js (`backend/package.json`)

| Package | Version | Purpose |
|---|---|---|
| express | ^4.18.2 | HTTP server & routing |
| mongodb | ^6.21.0 | Database driver |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.0 | JWT auth tokens |
| multer | ^1.4.5-lts.1 | Multipart file uploads |
| fluent-ffmpeg | ^2.1.2 | Audio processing |
| ffmpeg-static | ^5.1.0 | Bundled FFmpeg binary |
| fft-js | ^0.0.12 | Fast Fourier Transform |
| wav-decoder | ^1.0.0 | WAV file decoding |
| adm-zip | ^0.5.17 | ZIP file handling |
| uuid | ^9.0.1 | Unique ID generation |
| dotenv | ^16.3.1 | Environment variable loading |
| cors | ^2.8.5 | Cross-origin request handling |
| nodemon | ^3.0.1 | Dev auto-restart |

### Frontend — React (`frontend/audio_tracker/package.json`)

| Package | Version | Purpose |
|---|---|---|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM rendering |
| react-router-dom | ^6.24.0 | Client-side routing |
| vite | ^5.3.1 | Build tool & dev server |
| tailwindcss | ^3.4.4 | Utility-first CSS |
| postcss | ^8.4.39 | CSS processing |
| autoprefixer | ^10.4.19 | CSS vendor prefixing |

### Python Model Service (`model/requirements.txt`)

| Package | Version | Purpose |
|---|---|---|
| flask | 2.3.3 | HTTP server |
| faster-whisper | 1.1.1 | Speech-to-text (Whisper via CTranslate2) |
| rapidfuzz | 3.1.1 | Fuzzy string matching |
| werkzeug | 2.3.7 | WSGI utilities & secure filename |
| python-dotenv | 1.0.0 | Environment variable loading |

---

## Local Setup

### Prerequisites

Install the following before continuing:

```bash
# 1. Homebrew (macOS package manager)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (follow the instructions printed by the installer, then):
eval "$(/opt/homebrew/bin/brew shellenv)"

# 2. Node.js, MongoDB, FFmpeg
brew install node ffmpeg
brew tap mongodb/brew && brew install mongodb-community

# 3. Start MongoDB
brew services start mongodb-community

# 4. pyenv + Python 3.12 (the model service requires 3.12 — Python 3.14 is not supported by ML packages)
brew install pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zprofile
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zprofile
echo 'eval "$(pyenv init -)"' >> ~/.zprofile
source ~/.zprofile

pyenv install 3.12
```

### Step 1 — Clone / download the project

```bash
cd ~/Documents
# If using git:
# git clone <repo-url> MergeConflicts-main
cd MergeConflicts-main
```

### Step 2 — Create the backend environment file

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/mergeconflicts
MONGODB_DB_NAME=mergeconflicts

JWT_SECRET=your-secret-key-change-in-production
```

### Step 3 — Install Node.js dependencies

```bash
# From the project root — installs both backend and frontend
npm run install:all
```

### Step 4 — Install Python dependencies

```bash
cd model

# Pin this folder to Python 3.12
pyenv local 3.12

# Install packages
python -m pip install -r requirements.txt
```

### Step 5 — Start all three services

Open **three separate terminal tabs**:

**Tab 1 — Node.js backend (port 5000):**
```bash
export PATH="/opt/homebrew/bin:$PATH"
cd /path/to/MergeConflicts-main
npm run backend
```

**Tab 2 — React frontend (port 5173):**
```bash
export PATH="/opt/homebrew/bin:$PATH"
cd /path/to/MergeConflicts-main
npm run frontend
```

**Tab 3 — Python model service (port 5001):**
```bash
cd /path/to/MergeConflicts-main/model
python api.py
```

> **Tip:** Tabs 1 and 2 can be started together from the project root with `npm run dev`.

### Verify everything is running

| Service | URL | Expected response |
|---|---|---|
| Backend | http://localhost:5000/api/health | `{"status":"ok"}` |
| Frontend | http://localhost:5173 | Landing page |
| Python model | http://localhost:5001/health | `{"status":"healthy"}` |

---

## Running a Sample Audio

### Step 1 — Create an account

Open http://localhost:5173, click **Create Account**, and register with your email and password.

### Step 2 — Upload a reference song

The system matches against songs already in its database. Upload a reference song first.

Get your JWT token: open browser DevTools → Application → Local Storage → `ars_session` → copy the `token` value.

```bash
curl -X POST http://localhost:5000/api/songs/upload \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "songFile=@/path/to/reference-song.mp3" \
  -F "title=My Song"
```

Or use the Postman collection (`Audio_Identification_API_WITH_AUTH.postman_collection.json`) included in the repo.

### Step 3 — Identify an audio clip

**Via the web UI:**
1. Go to http://localhost:5173/home
2. Choose **Upload File** or **Record Audio**
3. Select your audio clip (5–30 seconds is ideal)
4. Click **Identify Song**
5. The result page shows the matched song, confidence score, and top alternatives

**Via curl:**
```bash
curl -X POST http://localhost:5000/api/songs/match \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "queryFile=@/path/to/clip.mp3"
```

**Expected response:**
```json
{
  "bestMatch": {
    "title": "My Song",
    "uploadedBy": "user-id"
  },
  "confidence": 87,
  "topMatches": [...],
  "matchingFeatures": {
    "spectral": 0.91,
    "waveform": 0.83,
    "signature": 0.79,
    "metadata": 0.95
  }
}
```

### Step 4 — Generate the lyrics database (optional)

To enable lyrics-based matching via the Python service, run the batch transcription script against your audio dataset:

```bash
# Place audio files in the data/ folder first
cd model
python scripts/gen_db.py
```

This transcribes every audio file in `data/` using Whisper and writes the results to `model/lyrics_db.json`. Once generated, the Python service at http://localhost:5001/api/match can match query audio against lyrics.

---

## Port Reference

| Service | Port |
|---|---|
| Node.js backend | 5000 |
| React frontend | 5173 |
| Python model service | 5001 |
| MongoDB | 27017 |
