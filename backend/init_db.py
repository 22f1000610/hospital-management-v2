"""
Database initialization script
Creates tables and seeds initial data including admin user
"""
from app import create_app
from app.models import db, User, Doctor, Patient, Department
from app.utils.auth import hash_password
from datetime import datetime

app = create_app()


def init_db():
    """Initialize database and create all tables"""
    with app.app_context():
        print('Creating database tables...')
        db.create_all()
        print('Database tables created successfully!')


def seed_admin():
    """Create pre-existing admin user"""
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@syntura.com').first()
        
        if admin:
            print('Admin user already exists')
            return
        
        # Create admin user
        admin = User(
            email='admin@syntura.com',
            password_hash=hash_password('admin123'),  # Default password
            role='admin'
        )
        
        db.session.add(admin)
        db.session.commit()
        
        print('Admin user created successfully!')
        print('Email: admin@syntura.com')
        print('Password: admin123')
        print('IMPORTANT: Change the admin password after first login!')


def seed_departments():
    """Seed default departments"""
    with app.app_context():
        departments = [
            {'name': 'Cardiology', 'icon': '❤️', 'description': 'Heart and cardiovascular care'},
            {'name': 'Neurology', 'icon': '🧠', 'description': 'Brain and nervous system'},
            {'name': 'Orthopedics', 'icon': '🦴', 'description': 'Bones and joints'},
            {'name': 'Pediatrics', 'icon': '👶', 'description': 'Child healthcare'},
            {'name': 'Dermatology', 'icon': '✨', 'description': 'Skin care'},
            {'name': 'General Medicine', 'icon': '🏥', 'description': 'General healthcare'}
        ]
        
        for dept_data in departments:
            dept = Department.query.filter_by(name=dept_data['name']).first()
            if not dept:
                dept = Department(**dept_data)
                db.session.add(dept)
        
        db.session.commit()
        print('Default departments seeded successfully!')


def seed_sample_data():
    """Seed sample doctors and patients for testing"""
    with app.app_context():
        # Sample doctors
        sample_doctors = [
            {
                'email': 'rajesh.kumar@syntura.com',
                'password': 'doctor123',
                'name': 'Dr. Rajesh Kumar',
                'phone': '+91-667-1234-5678',
                'specialization': 'Cardiology',
                'qualification': 'MD',
                'experience': 15
            },
            {
                'email': 'priya.sharma@syntura.com',
                'password': 'doctor123',
                'name': 'Dr. Priya Sharma',
                'phone': '+91-666-2345-6789',
                'specialization': 'Neurology',
                'qualification': 'DM',
                'experience': 12
            },
            {
                'email': 'anil.patel@syntura.com',
                'password': 'doctor123',
                'name': 'Dr. Anil Patel',
                'phone': '+91-667-3456-7890',
                'specialization': 'Pediatrics',
                'qualification': 'MBBS',
                'experience': 8
            }
        ]
        
        for doc_data in sample_doctors:
            user = User.query.filter_by(email=doc_data['email']).first()
            if not user:
                user = User(
                    email=doc_data['email'],
                    password_hash=hash_password(doc_data['password']),
                    role='doctor'
                )
                db.session.add(user)
                db.session.flush()
                
                doctor = Doctor(
                    user_id=user.id,
                    name=doc_data['name'],
                    phone=doc_data['phone'],
                    specialization=doc_data['specialization'],
                    qualification=doc_data['qualification'],
                    experience=doc_data['experience']
                )
                db.session.add(doctor)
        
        # Sample patients
        sample_patients = [
            {
                'email': 'deepika.singh@email.com',
                'password': 'patient123',
                'name': 'Deepika Singh',
                'age': 45,
                'gender': 'Female',
                'phone': '+91-667-4567-8901'
            },
            {
                'email': 'arjun.verma@email.com',
                'password': 'patient123',
                'name': 'Arjun Verma',
                'age': 32,
                'gender': 'Male',
                'phone': '+91-666-5678-9012'
            }
        ]
        
        for pat_data in sample_patients:
            user = User.query.filter_by(email=pat_data['email']).first()
            if not user:
                user = User(
                    email=pat_data['email'],
                    password_hash=hash_password(pat_data['password']),
                    role='patient'
                )
                db.session.add(user)
                db.session.flush()
                
                patient = Patient(
                    user_id=user.id,
                    name=pat_data['name'],
                    age=pat_data['age'],
                    gender=pat_data['gender'],
                    phone=pat_data['phone'],
                    registration_date=datetime.utcnow().date()
                )
                db.session.add(patient)
        
        db.session.commit()
        print('Sample data seeded successfully!')


if __name__ == '__main__':
    print('Initializing Hospital Management System Database...')
    init_db()
    seed_admin()
    seed_departments()
    seed_sample_data()
    print('\nDatabase initialization complete!')
