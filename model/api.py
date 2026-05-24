from flask import Flask
from controllers.audio_controller import audio_bp
from config import UPLOAD_FOLDER, FLASK_HOST, FLASK_PORT, FLASK_DEBUG
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

app.register_blueprint(audio_bp)

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
