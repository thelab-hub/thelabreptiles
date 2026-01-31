"""
Authentication Utility
Handles admin login/logout with bcrypt password hashing
"""

import os
import bcrypt
from functools import wraps
from flask import session, redirect, url_for, flash, request, jsonify


def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password, hashed):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def login_user(username, password):
    """
    Attempt to log in a user
    Returns (success, message)
    """
    admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_password_hash = os.environ.get('ADMIN_PASSWORD_HASH', '')

    # Check username
    if username != admin_username:
        return False, "Invalid credentials"

    # Check password
    # If no hash is set, compare plain text (development only!)
    if not admin_password_hash:
        # Development fallback - use plain password from env
        admin_password = os.environ.get('ADMIN_PASSWORD', '')
        if password == admin_password:
            session.permanent = True
            session['admin'] = True
            session['username'] = username
            return True, "Login successful"
        return False, "Invalid credentials"

    # Production - verify against hash
    if verify_password(password, admin_password_hash):
        session.permanent = True
        session['admin'] = True
        session['username'] = username
        return True, "Login successful"

    return False, "Invalid credentials"


def logout_user():
    """Log out the current user"""
    session.pop('admin', None)
    session.pop('username', None)


def is_logged_in():
    """Check if user is logged in"""
    return session.get('admin', False)


def admin_required(f):
    """Decorator to require admin login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_logged_in():
            # Check if it's an API request
            if request.path.startswith('/api/admin'):
                return jsonify({'error': 'Unauthorized'}), 401
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated_function


# Generate password hash for setup
if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        password = sys.argv[1]
        hashed = hash_password(password)
        print(f"Password hash for '{password}':")
        print(hashed)
    else:
        print("Usage: python auth.py <password>")
        print("Example: python auth.py TheLaboratory1265!")
