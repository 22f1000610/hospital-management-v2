"""
Task routes for triggering async operations
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Patient
from app.utils.auth import patient_required

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')


@tasks_bp.route('/export-history', methods=['POST'])
@jwt_required()
@patient_required
def export_history():
    """Trigger CSV export of patient's medical history"""
    current_user_id = get_jwt_identity()
    patient = Patient.query.filter_by(user_id=current_user_id).first()
    
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    try:
        # Import here to avoid circular imports
        from app.tasks.celery_tasks import export_patient_history
        
        # Trigger async task
        task = export_patient_history.delay(patient.id)
        
        return jsonify({
            'message': 'Export task started',
            'task_id': task.id,
            'status': 'processing'
        }), 202
    
    except Exception as e:
        return jsonify({'error': f'Failed to start export: {str(e)}'}), 500


@tasks_bp.route('/export-history/<task_id>', methods=['GET'])
@jwt_required()
@patient_required
def get_export_status(task_id):
    """Get the status of a CSV export task"""
    try:
        from app.tasks.celery_tasks import export_patient_history
        
        task = export_patient_history.AsyncResult(task_id)
        
        if task.state == 'PENDING':
            response = {
                'state': task.state,
                'status': 'Task is waiting to be processed'
            }
        elif task.state == 'SUCCESS':
            response = {
                'state': task.state,
                'result': task.result,
                'status': 'Task completed successfully'
            }
        elif task.state == 'FAILURE':
            response = {
                'state': task.state,
                'error': str(task.info),
                'status': 'Task failed'
            }
        else:
            response = {
                'state': task.state,
                'status': 'Task is being processed'
            }
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({'error': f'Failed to get task status: {str(e)}'}), 500
