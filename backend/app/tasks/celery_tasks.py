"""
Celery tasks for async operations
"""
from celery import shared_task
from app.models import db, Appointment, Treatment, Doctor, Patient
from datetime import datetime, date
import csv
import io
import logging

logger = logging.getLogger(__name__)


@shared_task(name='app.tasks.celery_tasks.export_patient_history')
def export_patient_history(patient_id):
    """
    Export patient's treatment history to CSV
    Task 1: User-triggered CSV export
    """
    try:
        logger.info(f'Exporting history for patient {patient_id}')
        
        # Query patient treatments
        treatments = Treatment.query.filter_by(patient_id=patient_id).order_by(
            Treatment.visit_date.desc()
        ).all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Date', 'Doctor', 'Department', 'Symptoms', 
            'Diagnosis', 'Prescription', 'Follow-up Date', 'Notes'
        ])
        
        # Write data
        for treatment in treatments:
            writer.writerow([
                treatment.visit_date.isoformat() if treatment.visit_date else '',
                treatment.doctor.name if treatment.doctor else '',
                treatment.doctor.specialization if treatment.doctor else '',
                treatment.symptoms,
                treatment.diagnosis,
                treatment.prescription,
                treatment.follow_up_date.isoformat() if treatment.follow_up_date else '',
                treatment.notes or ''
            ])
        
        csv_content = output.getvalue()
        output.close()
        
        logger.info(f'Successfully exported history for patient {patient_id}')
        
        # In a real application, you would:
        # 1. Save the CSV to a file storage (S3, local storage, etc.)
        # 2. Send an email to the patient with the download link
        # 3. Or use a notification system (Google Chat webhook, etc.)
        
        return {
            'status': 'success',
            'patient_id': patient_id,
            'csv_content': csv_content,
            'message': 'CSV export completed successfully'
        }
    
    except Exception as e:
        logger.error(f'Error exporting history for patient {patient_id}: {str(e)}')
        return {
            'status': 'error',
            'patient_id': patient_id,
            'error': str(e)
        }


@shared_task(name='app.tasks.celery_tasks.send_daily_reminders')
def send_daily_reminders():
    """
    Send daily appointment reminders
    Task 2: Scheduled task - runs daily
    """
    try:
        logger.info('Running daily appointment reminders')
        
        # Get today's appointments
        today = date.today()
        appointments = Appointment.query.filter_by(
            appointment_date=today,
            status='scheduled'
        ).all()
        
        reminder_count = 0
        
        for appointment in appointments:
            try:
                patient_email = appointment.patient.user.email if appointment.patient and appointment.patient.user else None
                doctor_name = appointment.doctor.name if appointment.doctor else 'Doctor'
                
                if patient_email:
                    # In a real application, send email/SMS/notification here
                    logger.info(
                        f'Reminder sent to {patient_email} for appointment with '
                        f'{doctor_name} at {appointment.appointment_time}'
                    )
                    reminder_count += 1
                    
                    # Example: Send via Google Chat webhook
                    # send_chat_notification(patient_email, appointment)
                    
            except Exception as e:
                logger.error(f'Error sending reminder for appointment {appointment.id}: {str(e)}')
        
        logger.info(f'Sent {reminder_count} reminders for {len(appointments)} appointments')
        
        return {
            'status': 'success',
            'date': today.isoformat(),
            'total_appointments': len(appointments),
            'reminders_sent': reminder_count
        }
    
    except Exception as e:
        logger.error(f'Error in daily reminders task: {str(e)}')
        return {
            'status': 'error',
            'error': str(e)
        }


@shared_task(name='app.tasks.celery_tasks.send_monthly_reports')
def send_monthly_reports():
    """
    Send monthly activity reports to doctors
    Task 3: Scheduled task - runs on 1st of each month
    """
    try:
        logger.info('Running monthly doctor reports')
        
        # Get all doctors
        doctors = Doctor.query.all()
        
        reports_sent = 0
        
        for doctor in doctors:
            try:
                # Get doctor's appointments from last month
                from datetime import timedelta
                from dateutil.relativedelta import relativedelta
                
                today = date.today()
                first_day_this_month = today.replace(day=1)
                last_day_last_month = first_day_this_month - timedelta(days=1)
                first_day_last_month = last_day_last_month.replace(day=1)
                
                appointments = Appointment.query.filter(
                    Appointment.doctor_id == doctor.id,
                    Appointment.appointment_date >= first_day_last_month,
                    Appointment.appointment_date <= last_day_last_month
                ).all()
                
                completed = sum(1 for apt in appointments if apt.status == 'completed')
                cancelled = sum(1 for apt in appointments if apt.status == 'cancelled')
                
                # Get treatments created
                treatments = Treatment.query.filter(
                    Treatment.doctor_id == doctor.id,
                    Treatment.visit_date >= first_day_last_month,
                    Treatment.visit_date <= last_day_last_month
                ).count()
                
                # Generate report
                report = {
                    'doctor_name': doctor.name,
                    'month': last_day_last_month.strftime('%B %Y'),
                    'total_appointments': len(appointments),
                    'completed_appointments': completed,
                    'cancelled_appointments': cancelled,
                    'treatment_records': treatments,
                    'specialization': doctor.specialization
                }
                
                doctor_email = doctor.user.email if doctor.user else None
                
                if doctor_email:
                    # In a real application, send HTML/PDF report via email
                    logger.info(f'Monthly report sent to {doctor_email}')
                    reports_sent += 1
                    
                    # Example: Generate HTML report and email it
                    # html_report = generate_html_report(report)
                    # send_email(doctor_email, 'Monthly Activity Report', html_report)
                    
            except Exception as e:
                logger.error(f'Error generating report for doctor {doctor.id}: {str(e)}')
        
        logger.info(f'Sent {reports_sent} monthly reports to {len(doctors)} doctors')
        
        return {
            'status': 'success',
            'total_doctors': len(doctors),
            'reports_sent': reports_sent
        }
    
    except Exception as e:
        logger.error(f'Error in monthly reports task: {str(e)}')
        return {
            'status': 'error',
            'error': str(e)
        }
