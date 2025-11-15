# Hospital Management System - Backend API

Flask-based backend API for the Hospital Management System.

## Technology Stack

- **Framework**: Flask 3.0
- **Database**: SQLite with Flask-SQLAlchemy
- **Authentication**: JWT (Flask-JWT-Extended)
- **Caching**: Redis
- **Async Tasks**: Celery with Redis broker
- **CORS**: Flask-CORS

## Setup Instructions

### Prerequisites

- Python 3.8+
- Redis server running on localhost:6379

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize database:
```bash
python init_db.py
```

This will:
- Create all database tables
- Create an admin user (email: admin@syntura.com, password: admin123)
- Seed default departments
- Create sample doctors and patients for testing

### Running the Application

1. Start the Flask API server:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

2. Start Celery worker (in a separate terminal):
```bash
celery -A run.celery worker --loglevel=info
```

3. Start Celery Beat for scheduled tasks (in a separate terminal):
```bash
celery -A run.celery beat --loglevel=info
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Admin Endpoints (requires admin role)
- `GET /api/admin/doctors` - Get all doctors
- `POST /api/admin/doctors` - Create a new doctor
- `GET /api/admin/doctors/<id>` - Get specific doctor
- `PUT /api/admin/doctors/<id>` - Update doctor
- `DELETE /api/admin/doctors/<id>` - Delete doctor
- `GET /api/admin/patients` - Get all patients
- `PUT /api/admin/patients/<id>` - Update patient
- `GET /api/admin/appointments` - Get all appointments

### Doctor Endpoints (requires doctor role)
- `GET /api/doctor/appointments` - Get doctor's appointments
- `PUT /api/doctor/appointments/<id>/status` - Update appointment status
- `GET /api/doctor/patients` - Get assigned patients
- `GET /api/doctor/patients/<id>/history` - Get patient's treatment history
- `POST /api/doctor/treatments` - Create treatment record
- `PUT /api/doctor/treatments/<id>` - Update treatment record
- `GET /api/doctor/profile` - Get doctor profile
- `PUT /api/doctor/profile` - Update doctor profile

### Patient Endpoints (requires patient role)
- `GET /api/patient/doctors` - Get all doctors (with filtering)
- `GET /api/patient/departments` - Get all departments
- `GET /api/patient/appointments` - Get patient's appointments
- `POST /api/patient/appointments` - Book new appointment
- `PUT /api/patient/appointments/<id>` - Reschedule appointment
- `DELETE /api/patient/appointments/<id>` - Cancel appointment
- `GET /api/patient/history` - Get medical history
- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update patient profile

### Task Endpoints
- `POST /api/tasks/export-history` - Trigger CSV export (async)
- `GET /api/tasks/export-history/<task_id>` - Get export task status

## Default Credentials

**Admin:**
- Email: admin@syntura.com
- Password: admin123

**Sample Doctor:**
- Email: rajesh.kumar@syntura.com
- Password: doctor123

**Sample Patient:**
- Email: deepika.singh@email.com
- Password: patient123

## Celery Tasks

### User-Triggered Tasks
- **CSV Export**: Exports patient's medical history to CSV

### Scheduled Tasks
- **Daily Reminders**: Runs daily at 9 AM to send appointment reminders
- **Monthly Reports**: Runs on 1st of each month to send doctor activity reports

## Database Models

- **User**: Authentication and role management
- **Doctor**: Doctor profiles and information
- **Patient**: Patient profiles and information
- **Appointment**: Appointment bookings
- **Treatment**: Medical history and treatment records
- **Department**: Medical departments/specializations

## Caching

Redis caching is implemented for frequently accessed endpoints:
- Doctor lists
- Department lists

Cache timeout: 5 minutes (configurable in config.py)

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing using Werkzeug
- CORS protection

## Development

The application is configured for development mode by default. For production:

1. Update SECRET_KEY and JWT_SECRET_KEY in .env
2. Set appropriate CORS_ORIGINS
3. Configure production database
4. Set DEBUG=False in config.py
