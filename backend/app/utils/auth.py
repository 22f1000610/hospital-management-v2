"""
Authentication and authorization utilities
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(password):
    """Hash a password"""
    return generate_password_hash(password)


def verify_password(password_hash, password):
    """Verify a password against a hash"""
    return check_password_hash(password_hash, password)


def role_required(*roles):
    """Decorator to require specific roles"""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get('role')
            
            if user_role not in roles:
                return jsonify({'error': 'Unauthorized access'}), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def admin_required(fn):
    """Decorator to require admin role"""
    return role_required('admin')(fn)


def doctor_required(fn):
    """Decorator to require doctor role"""
    return role_required('doctor')(fn)


def patient_required(fn):
    """Decorator to require patient role"""
    return role_required('patient')(fn)
