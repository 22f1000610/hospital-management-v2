# Hospital Management System V2

Full-stack Hospital Management System built with Flask (Backend) and Vue.js (Frontend).

## Project Overview

This is a comprehensive hospital management system that implements role-based access control for three types of users: Admin, Doctor, and Patient. The system provides features for managing doctors, patients, appointments, and medical treatments.

## Technology Stack

### Backend
- **Framework**: Flask 3.0
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (Flask-JWT-Extended)
- **Caching**: Redis
- **Async Tasks**: Celery with Redis broker
- **CORS**: Flask-CORS

### Frontend
- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router
- **UI Framework**: Bootstrap 5
- **HTTP Client**: Axios

## Features

### Admin Features
- CRUD operations for doctors
- View and manage all patients
- View and manage all appointments
- Dashboard with statistics

### Doctor Features
- View assigned appointments
- Update appointment status
- View patient history
- Create and update treatment records
- Manage own profile

### Patient Features
- Register and login
- Browse doctors by specialization
- Book, reschedule, and cancel appointments
- View medical history
- Export medical history to CSV (async task)
- Receive appointment reminders (scheduled task)

### System Features
- JWT-based authentication with automatic token refresh
- Role-based access control (RBAC)
- Light/Dark theme toggle
- Redis caching for frequently accessed data
- Celery async tasks:
  - CSV export of patient history
  - Daily appointment reminders
  - Monthly doctor activity reports

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 20+
- Redis server

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize database:
```bash
python init_db.py
```

4. Start Flask server:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

5. (Optional) Start Celery worker for async tasks:
```bash
celery -A run.celery worker --loglevel=info
```

6. (Optional) Start Celery Beat for scheduled tasks:
```bash
celery -A run.celery beat --loglevel=info
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Credentials

### Admin
- Email: admin@syntura.com
- Password: admin123

### Sample Doctor
- Email: rajesh.kumar@syntura.com
- Password: doctor123

### Sample Patient
- Email: deepika.singh@email.com
- Password: patient123

## Project Structure

```
hospital-management-v2/
├── backend/              # Flask backend
│   ├── app/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   ├── tasks/       # Celery tasks
│   │   └── utils/       # Utilities (auth, cache)
│   ├── config.py        # Configuration
│   ├── init_db.py       # Database initialization
│   ├── run.py           # Application entry point
│   └── requirements.txt
├── frontend/             # Vue.js frontend
│   ├── src/
│   │   ├── assets/      # Styles
│   │   ├── components/  # Reusable components
│   │   ├── router/      # Route configuration
│   │   ├── services/    # API client
│   │   ├── stores/      # Pinia stores
│   │   └── views/       # Page components
│   └── package.json
└── README.md

```

## API Documentation

The backend provides RESTful API endpoints organized by role:

- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin-only endpoints
- `/api/doctor/*` - Doctor-only endpoints
- `/api/patient/*` - Patient-only endpoints
- `/api/tasks/*` - Async task endpoints

See `backend/README.md` for detailed API documentation.

## Development

### Backend Development
```bash
cd backend
python run.py
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Reset
To reset the database and re-seed sample data:
```bash
cd backend
rm hospital.db
python init_db.py
```

## Security

- Passwords are hashed using Werkzeug's security functions
- JWT tokens with automatic refresh
- Role-based access control on all protected routes
- CORS configuration for cross-origin requests

## License

This is a student project for IITM BS Degree Course (MAD2 Project).

## Acknowledgments

- Original static prototype used as visual reference
- Bootstrap 5 for UI components
- Vue.js 3 and Flask communities for excellent documentation
