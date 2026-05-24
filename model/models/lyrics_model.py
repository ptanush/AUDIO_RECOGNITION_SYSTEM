"""
Database utilities for loading and managing the lyrics database.
"""

import json
import os
from config import LYRICS_DB_PATH


def load_database():
    """Load lyrics database from JSON file."""
    if not os.path.exists(LYRICS_DB_PATH):
        return {}
    
    try:
        with open(LYRICS_DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading database: {e}")
        return {}


def save_database(data):
    """Save lyrics database to JSON file."""
    try:
        os.makedirs(os.path.dirname(LYRICS_DB_PATH), exist_ok=True)
        with open(LYRICS_DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving database: {e}")
        return False


def get_song_lyrics(song_name):
    """Get lyrics for a specific song."""
    database = load_database()
    return database.get(song_name, None)


def add_song_lyrics(song_name, lyrics):
    """Add or update a song's lyrics in the database."""
    database = load_database()
    database[song_name] = lyrics
    return save_database(database)


def remove_song_lyrics(song_name):
    """Remove a song from the database."""
    database = load_database()
    if song_name in database:
        del database[song_name]
        return save_database(database)
    return False


def get_database_stats():
    """Get statistics about the database."""
    database = load_database()
    total_songs = len(database)
    total_words = sum(len(lyrics.split()) for lyrics in database.values())
    
    return {
        'total_songs': total_songs,
        'total_words': total_words,
        'avg_words_per_song': total_words // total_songs if total_songs > 0 else 0
    }
