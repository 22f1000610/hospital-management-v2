"""
Admin routes - CRUD operations for doctors, patients, and appointments
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Doctor, Patient, Appointment
from app.utils.auth import admin_required, hash_password
from app.utils.cache import cache

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


# ===== Doctor Management =====

@admin_bp.route('/doctors', methods=['GET'])
@jwt_required()
@admin_required
def get_doctors():
    """Get all doctors"""
    doctors = Doctor.query.all()
    return jsonify([doctor.to_dict() for doctor in doctors]), 200


@admin_bp.route('/doctors', methods=['POST'])
@jwt_required()
@admin_required
def create_doctor():
    """Create a new doctor"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'name', 'phone', 'specialization', 'qualification', 'experience']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    try:
        # Create user account
        user = User(
            email=data['email'],
            password_hash=hash_password(data['password']),
            role='doctor'
        )
        db.session.add(user)
        db.session.flush()
        
        # Create doctor profile
        doctor = Doctor(
            user_id=user.id,
            name=data['name'],
            phone=data['phone'],
            specialization=data['specialization'],
            qualification=data['qualification'],
            experience=data['experience']
        )
        db.session.add(doctor)
        db.session.commit()
        
        # Clear doctors cache
        cache.delete('view:get_all_doctors')
        
        return jsonify({
            'message': 'Doctor created successfully',
            'doctor': doctor.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create doctor: {str(e)}'}), 500


@admin_bp.route('/doctors/<int:doctor_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_doctor(doctor_id):
    """Get a specific doctor"""
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    return jsonify(doctor.to_dict()), 200


@admin_bp.route('/doctors/<int:doctor_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_doctor(doctor_id):
    """Update a doctor"""
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    data = request.get_json()
    
    try:
        # Update doctor fields
        if 'name' in data:
            doctor.name = data['name']
        if 'phone' in data:
            doctor.phone = data['phone']
        if 'specialization' in data:
            doctor.specialization = data['specialization']
        if 'qualification' in data:
            doctor.qualification = data['qualification']
        if 'experience' in data:
            doctor.experience = data['experience']
        
        # Update email if provided
        if 'email' in data and data['email'] != doctor.user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already in use'}), 409
            doctor.user.email = data['email']
        
        db.session.commit()
        
        # Clear doctors cache
        cache.delete('view:get_all_doctors')
        
        return jsonify({
            'message': 'Doctor updated successfully',
            'doctor': doctor.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update doctor: {str(e)}'}), 500


@admin_bp.route('/doctors/<int:doctor_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_doctor(doctor_id):
    """Delete a doctor"""
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    try:
        user = doctor.user
        db.session.delete(doctor)
        db.session.delete(user)
        db.session.commit()
        
        # Clear doctors cache
        cache.delete('view:get_all_doctors')
        
        return jsonify({'message': 'Doctor deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete doctor: {str(e)}'}), 500


# ===== Patient Management =====

@admin_bp.route('/patients', methods=['GET'])
@jwt_required()
@admin_required
def get_patients():
    """Get all patients"""
    patients = Patient.query.all()
    return jsonify([patient.to_dict() for patient in patients]), 200


@admin_bp.route('/patients/<int:patient_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_patient(patient_id):
    """Get a specific patient"""
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    return jsonify(patient.to_dict()), 200


@admin_bp.route('/patients/<int:patient_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_patient(patient_id):
    """Update a patient"""
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    data = request.get_json()
    
    try:
        # Update patient fields
        if 'name' in data:
            patient.name = data['name']
        if 'age' in data:
            patient.age = data['age']
        if 'gender' in data:
            patient.gender = data['gender']
        if 'phone' in data:
            patient.phone = data['phone']
        if 'registration_date' in data:
            from datetime import datetime
            patient.registration_date = datetime.fromisoformat(data['registration_date']).date()
        
        # Update email if provided
        if 'email' in data and data['email'] != patient.user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already in use'}), 409
            patient.user.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Patient updated successfully',
            'patient': patient.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update patient: {str(e)}'}), 500


@admin_bp.route('/patients/<int:patient_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_patient(patient_id):
    """Delete a patient"""
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    try:
        user = patient.user
        db.session.delete(patient)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Patient deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete patient: {str(e)}'}), 500


# ===== Appointment Management =====

@admin_bp.route('/appointments', methods=['GET'])
@jwt_required()
@admin_required
def get_appointments():
    """Get all appointments"""
    appointments = Appointment.query.order_by(Appointment.appointment_date.desc()).all()
    return jsonify([appointment.to_dict() for appointment in appointments]), 200


@admin_bp.route('/appointments/<int:appointment_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_appointment(appointment_id):
    """Get a specific appointment"""
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    return jsonify(appointment.to_dict()), 200


@admin_bp.route('/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_appointment(appointment_id):
    """Update an appointment"""
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'status' in data:
            appointment.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update appointment: {str(e)}'}), 500


@admin_bp.route('/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_appointment(appointment_id):
    """Delete an appointment"""
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    try:
        db.session.delete(appointment)
        db.session.commit()
        
        return jsonify({'message': 'Appointment deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete appointment: {str(e)}'}), 500
