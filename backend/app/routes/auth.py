"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models import db, User, Doctor, Patient
from app.utils.auth import hash_password, verify_password
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not verify_password(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create tokens
    additional_claims = {'role': user.role}
    access_token = create_access_token(identity=user.id, additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=user.id, additional_claims=additional_claims)
    
    # Get user profile data
    profile = None
    if user.role == 'doctor':
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        profile = doctor.to_dict() if doctor else None
    elif user.role == 'patient':
        patient = Patient.query.filter_by(user_id=user.id).first()
        profile = patient.to_dict() if patient else None
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'profile': profile
        }
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    """Patient registration (Admin registration is disabled)"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'name', 'age', 'gender', 'phone']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    try:
        # Create user
        user = User(
            email=data['email'],
            password_hash=hash_password(data['password']),
            role='patient'
        )
        db.session.add(user)
        db.session.flush()
        
        # Create patient profile
        patient = Patient(
            user_id=user.id,
            name=data['name'],
            age=data['age'],
            gender=data['gender'],
            phone=data['phone'],
            registration_date=datetime.utcnow().date()
        )
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Registration successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    additional_claims = {'role': user.role}
    access_token = create_access_token(identity=current_user_id, additional_claims=additional_claims)
    
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    profile = None
    if user.role == 'doctor':
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        profile = doctor.to_dict() if doctor else None
    elif user.role == 'patient':
        patient = Patient.query.filter_by(user_id=user.id).first()
        profile = patient.to_dict() if patient else None
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'profile': profile
    }), 200
