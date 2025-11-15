"""
Doctor routes - Appointment management and patient treatment
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Doctor, Patient, Appointment, Treatment
from app.utils.auth import doctor_required
from datetime import datetime

doctor_bp = Blueprint('doctor', __name__, url_prefix='/api/doctor')


@doctor_bp.route('/appointments', methods=['GET'])
@jwt_required()
@doctor_required
def get_doctor_appointments():
    """Get all appointments for the logged-in doctor"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    # Get query parameters for filtering
    status = request.args.get('status')
    date = request.args.get('date')
    
    query = Appointment.query.filter_by(doctor_id=doctor.id)
    
    if status:
        query = query.filter_by(status=status)
    
    if date:
        query = query.filter_by(appointment_date=datetime.fromisoformat(date).date())
    
    appointments = query.order_by(Appointment.appointment_date, Appointment.appointment_time).all()
    
    return jsonify([appointment.to_dict() for appointment in appointments]), 200


@doctor_bp.route('/appointments/<int:appointment_id>', methods=['GET'])
@jwt_required()
@doctor_required
def get_appointment(appointment_id):
    """Get a specific appointment"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=doctor.id).first()
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    return jsonify(appointment.to_dict()), 200


@doctor_bp.route('/appointments/<int:appointment_id>/status', methods=['PUT'])
@jwt_required()
@doctor_required
def update_appointment_status(appointment_id):
    """Update appointment status"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=doctor.id).first()
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    try:
        appointment.status = data['status']
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment status updated successfully',
            'appointment': appointment.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update appointment: {str(e)}'}), 500


@doctor_bp.route('/patients', methods=['GET'])
@jwt_required()
@doctor_required
def get_assigned_patients():
    """Get all patients assigned to the logged-in doctor"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    # Get unique patients who have appointments with this doctor
    patients = db.session.query(Patient).join(Appointment).filter(
        Appointment.doctor_id == doctor.id
    ).distinct().all()
    
    return jsonify([patient.to_dict() for patient in patients]), 200


@doctor_bp.route('/patients/<int:patient_id>/history', methods=['GET'])
@jwt_required()
@doctor_required
def get_patient_history(patient_id):
    """Get treatment history for a specific patient"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    # Get all treatments for this patient
    treatments = Treatment.query.filter_by(patient_id=patient_id).order_by(
        Treatment.visit_date.desc()
    ).all()
    
    return jsonify([treatment.to_dict() for treatment in treatments]), 200


@doctor_bp.route('/treatments', methods=['POST'])
@jwt_required()
@doctor_required
def create_treatment():
    """Create a new treatment record"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['patient_id', 'visit_date', 'symptoms', 'diagnosis', 'prescription']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Verify patient exists
    patient = Patient.query.get(data['patient_id'])
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    try:
        treatment = Treatment(
            patient_id=data['patient_id'],
            doctor_id=doctor.id,
            visit_date=datetime.fromisoformat(data['visit_date']).date(),
            symptoms=data['symptoms'],
            diagnosis=data['diagnosis'],
            prescription=data['prescription'],
            follow_up_date=datetime.fromisoformat(data['follow_up_date']).date() if data.get('follow_up_date') else None,
            notes=data.get('notes')
        )
        
        db.session.add(treatment)
        db.session.commit()
        
        return jsonify({
            'message': 'Treatment record created successfully',
            'treatment': treatment.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create treatment: {str(e)}'}), 500


@doctor_bp.route('/treatments/<int:treatment_id>', methods=['PUT'])
@jwt_required()
@doctor_required
def update_treatment(treatment_id):
    """Update a treatment record"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    treatment = Treatment.query.filter_by(id=treatment_id, doctor_id=doctor.id).first()
    if not treatment:
        return jsonify({'error': 'Treatment record not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'visit_date' in data:
            treatment.visit_date = datetime.fromisoformat(data['visit_date']).date()
        if 'symptoms' in data:
            treatment.symptoms = data['symptoms']
        if 'diagnosis' in data:
            treatment.diagnosis = data['diagnosis']
        if 'prescription' in data:
            treatment.prescription = data['prescription']
        if 'follow_up_date' in data:
            treatment.follow_up_date = datetime.fromisoformat(data['follow_up_date']).date() if data['follow_up_date'] else None
        if 'notes' in data:
            treatment.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Treatment record updated successfully',
            'treatment': treatment.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update treatment: {str(e)}'}), 500


@doctor_bp.route('/profile', methods=['GET'])
@jwt_required()
@doctor_required
def get_doctor_profile():
    """Get the logged-in doctor's profile"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    return jsonify(doctor.to_dict()), 200


@doctor_bp.route('/profile', methods=['PUT'])
@jwt_required()
@doctor_required
def update_doctor_profile():
    """Update the logged-in doctor's profile"""
    current_user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    data = request.get_json()
    
    try:
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
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'doctor': doctor.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500
