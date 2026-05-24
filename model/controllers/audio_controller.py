from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
from services.matcher_service import process_audio_and_match, transcribe_audio
from models.lyrics_model import load_database
from config import ALLOWED_EXTENSIONS, MATCH_THRESHOLD

audio_bp = Blueprint('audio', __name__)


def allowed_file(filename):
    return '.' in filename and os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


@audio_bp.route('/health', methods=['GET'])
def health_check():
    database = load_database()
    return jsonify({
        'status': 'healthy',
        'service': 'AUDIO RECOGNITION SYSTEM',
        'database_loaded': len(database) > 0,
        'songs_in_database': len(database)
    }), 200


@audio_bp.route('/api/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': f'File format not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        try:
            text = transcribe_audio(filepath)
            return jsonify({'success': True, 'text': text}), 200
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@audio_bp.route('/api/match', methods=['POST'])
def match():
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': f'File format not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        try:
            result = process_audio_and_match(filepath)
            if 'error' in result:
                return jsonify({'success': False, 'error': result['error']}), 400
            if result['confidence'] < MATCH_THRESHOLD:
                return jsonify({
                    'success': True,
                    'best_match': None,
                    'confidence': result['confidence'],
                    'top_matches': result['top_matches'],
                    'extracted_text': result['extracted_text'],
                    'message': f'No strong match found (threshold: {MATCH_THRESHOLD}%)'
                }), 200
            return jsonify({
                'success': True,
                'best_match': result['best_match'],
                'confidence': result['confidence'],
                'top_matches': result['top_matches'],
                'extracted_text': result['extracted_text']
            }), 200
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@audio_bp.route('/api/database/info', methods=['GET'])
def database_info():
    try:
        database = load_database()
        songs = list(database.keys())
        if len(songs) > 100:
            songs = songs[:100] + [f"... and {len(database) - 100} more"]
        return jsonify({'success': True, 'total_songs': len(database), 'songs': songs}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
