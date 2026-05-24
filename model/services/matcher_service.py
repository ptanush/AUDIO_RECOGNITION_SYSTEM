from faster_whisper import WhisperModel
from rapidfuzz import fuzz
from config import WHISPER_MODEL_SIZE, MATCH_THRESHOLD
from models.lyrics_model import load_database

model = WhisperModel(WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")


def transcribe_audio(audio_path):
    segments, _ = model.transcribe(audio_path)
    return " ".join(seg.text for seg in segments)


def match_lyrics(query_text, database):
    best_song = None
    best_score = 0
    all_scores = []

    for song, lyrics in database.items():
        score = fuzz.partial_ratio(query_text.lower(), lyrics.lower())
        all_scores.append({'song': song, 'score': round(score, 2)})
        if score > best_score:
            best_score = score
            best_song = song

    all_scores = sorted(all_scores, key=lambda x: x['score'], reverse=True)
    return {
        'best_match': best_song,
        'confidence': min(round(best_score, 2), 100),
        'all_scores': all_scores[:5]
    }


def process_audio_and_match(audio_path):
    database = load_database()

    if not database:
        return {
            'extracted_text': None,
            'best_match': None,
            'confidence': 0,
            'top_matches': [],
            'error': 'Lyrics database is empty. Please generate it first.'
        }

    extracted_text = transcribe_audio(audio_path)
    match_result = match_lyrics(extracted_text, database)

    return {
        'extracted_text': extracted_text,
        'best_match': match_result['best_match'],
        'confidence': match_result['confidence'],
        'top_matches': match_result['all_scores']
    }