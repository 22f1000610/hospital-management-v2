"""
Patient routes - Doctor search, appointment booking, and medical history
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Doctor, Patient, Appointment, Treatment, Department
from app.utils.auth import patient_required
from app.utils.cache import cached
from datetime import datetime

patient_bp = Blueprint('patient', __name__, url_prefix='/api/patient')


@patient_bp.route('/doctors', methods=['GET'])
@jwt_required()
@patient_required
def get_doctors():
    """Get all doctors with optional filtering"""
    specialization = request.args.get('specialization')
    
    query = Doctor.query
    
    if specialization:
        query = query.filter_by(specialization=specialization)
    
    doctors = query.all()
    return jsonify([doctor.to_dict() for doctor in doctors]), 200


@patient_bp.route('/doctors/<int:doctor_id>', methods=['GET'])
@jwt_required()
@patient_required
def get_doctor(doctor_id):
    """Get a specific doctor"""
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    return jsonify(doctor.to_dict()), 200


@patient_bp.route('/departments', methods=['GET'])
@jwt_required()
@patient_required
def get_departments():
    """Get all departments"""
    departments = Department.query.all()
    
    # If no departments exist, return default list
    if not departments:
        default_departments = [
            {'name': 'Cardiology', 'icon': '❤️', 'description': 'Heart and cardiovascular care'},
            {'name': 'Neurology', 'icon': '🧠', 'description': 'Brain and nervous system'},
            {'name': 'Orthopedics', 'icon': '🦴', 'description': 'Bones and joints'},
            {'name': 'Pediatrics', 'icon': '👶', 'description': 'Child healthcare'},
            {'name': 'Dermatology', 'icon': '✨', 'description': 'Skin care'},
            {'name': 'General Medicine', 'icon': '🏥', 'description': 'General healthcare'}
        ]
        return jsonify(default_departments), 200
    
    return jsonify([dept.to_dict() for dept in departments]), 200


@patient_bp.route('/appointments', methods=['GET'])
@jwt_required()
@patient_required
def get_patient_appointments():
    """Get all appointments for the logged-in patient"""
    current_user_id = get_jwt_identity()
    patient = Patient.query.filter_by(user_id=current_user_id).first()
    
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    # Get query parameters for filtering
    status = request.args.get('status')
    
    query = Appointment.query.filter_by(patient_id=patient.id)
    
    if status:
        query = query.filter_by(status=status)
    
    appointments = query.order_by(Appointment.appointment_date.desc()).all()
    
    return jsonify([appointment.to_dict() for appointment in appointments]), 200


@patient_bp.route('/appointments', methods=['POST'])
@jwt_required()
@patient_required
def book_appointment():
    """Book a new appointment"""
    current_user_id = get_jwt_identity()
    patient = Patient.query.filter_by(user_id=current_user_id).first()
    
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['doctor_id', 'appointment_date', 'appointment_time']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Verify doctor exists
    doctor = Doctor.query.get(data['doctor_id'])
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    try:
        appointment = Appointment(
            patient_id=patient.id,
            doctor_id=data['doctor_id'],
            appointment_date=datetime.fromisoformat(data['appointment_date']).date(),
            appointment_time=data['appointment_time'],
            reason=data.get('reason', ''),
            status='scheduled'
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment booked successfully',
            'appointment': appointment.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to book appointment: {str(e)}'}), 500


@patient_bp.route('/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
@patient_required
def reschedule_appointment(appointment_id):
    """Reschedule an appointment"""
    current_user_id = get_jwt_identity()
    patient = Patient.query.filter_by(user_id=current_user_id).first()
    
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    appointment = Appointment.query.filter_by(id=appointment_id, patient_id=patient.id).first()
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'appointment_date' in data:
            appointment.appointment_date = datetime.fromisoformat(data['appointment_date']).date()
        if 'appointment_time' in data:
            appointment.appointment_time = data['appointment_time']
        if 'reason' in data:
            appointment.reason = data['reason']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment rescheduled successfully',
            'appointment': appointment.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to reschedule appointment: {str(e)}'}), 500


@patient_bp.route('/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
@patient_required
def cancel_appointment(appointment_id):
    """Cancel an appointment"""
    current_user_id = get_jwt_identity()
    patient = Patient.query.filter_by(user_id=current_user_id).first()
    
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    appointment = Appointment.query.filter_by(id=appointment_id, patient_id=patient.id).first()
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    try:
        # Option 1: Soft delete by changing status
        appointment.status = 'cancelled'
        db.session.commit()
        
        return jsonify({'message': 'Appointment cancelled successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to cancel appointment: {str(e)}'}), 500


@patient_bp.route('/history', methods=['GET'])
@jwt_required()
@patient_required
def get_medical_history():
    """Get medical history for the logged-in patient"""
    current_user_id = get_jwt_identity()
    patient = Patient.query.filter_by(user_id=current_user_id).first()
    
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    treatments = Treatment.query.filter_by(patient_id=patient.id).order_by(
        Treatment.visit_date.desc()
    ).all()
    
    return jsonify([treatment.to_dict() for treatment in treatments]), 200


@patient_bp.route('/profile', methods=['GET'])
@jwt_required()
@patient_required
def get_patient_profile():
    """Get the logged-in patient's profile"""
    current_user_id = get_jwt_identity()
    patient = Patient.query.filter_by(user_id=current_user_id).first()
    
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    return jsonify(patient.to_dict()), 200


@patient_bp.route('/profile', methods=['PUT'])
@jwt_required()
@patient_required
def update_patient_profile():
    """Update the logged-in patient's profile"""
    current_user_id = get_jwt_identity()
    patient = Patient.query.filter_by(user_id=current_user_id).first()
    
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            patient.name = data['name']
        if 'age' in data:
            patient.age = data['age']
        if 'gender' in data:
            patient.gender = data['gender']
        if 'phone' in data:
            patient.phone = data['phone']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'patient': patient.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500
