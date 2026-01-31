"""
The Lab Reptiles - Backend Application
Main Flask application with admin console and public API
"""

import os
from datetime import timedelta
from flask import Flask, redirect, url_for, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SESSION_SECRET', 'dev-secret-change-in-production')
app.permanent_session_lifetime = timedelta(hours=2)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Configuration
app.config['GOOGLE_SHEET_ID'] = os.environ.get('GOOGLE_SHEET_ID', '')
app.config['ADMIN_USERNAME'] = os.environ.get('ADMIN_USERNAME', 'admin')
app.config['ADMIN_PASSWORD_HASH'] = os.environ.get('ADMIN_PASSWORD_HASH', '')
app.config['NOTIFICATION_EMAIL'] = os.environ.get('NOTIFICATION_EMAIL', '')

# Import and register routes
from routes.admin import admin_bp
from routes.public import public_bp
from routes.api import api_bp

app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(public_bp)
app.register_blueprint(api_bp, url_prefix='/api')

# Root redirect
@app.route('/')
def index():
    return redirect(url_for('public.home'))

# Health check for Railway
@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return {'error': 'Not found'}, 404

@app.errorhandler(500)
def server_error(e):
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
