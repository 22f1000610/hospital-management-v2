# Hospital Management System - Frontend

Vue.js 3 frontend for the Hospital Management System.

## Technology Stack

- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router
- **UI Framework**: Bootstrap 5
- **HTTP Client**: Axios

## Setup Instructions

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment configuration:
The `.env` file is already configured with:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Run development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── assets/           # Static assets and styles
├── components/       # Reusable Vue components
│   └── Navbar.vue    # Navigation bar with theme toggle
├── router/           # Vue Router configuration
│   └── index.js      # Route definitions with auth guards
├── services/         # API services
│   └── api.js        # Axios API client
├── stores/           # Pinia stores
│   ├── auth.js       # Authentication state
│   └── theme.js      # Theme (dark/light mode) state
├── views/            # Page components
│   ├── HomeView.vue          # Landing page
│   ├── LoginView.vue         # Login page
│   ├── RegisterView.vue      # Patient registration
│   ├── AdminDashboard.vue    # Admin dashboard
│   ├── DoctorDashboard.vue   # Doctor dashboard
│   └── PatientDashboard.vue  # Patient dashboard
├── App.vue           # Root component
└── main.js           # Application entry point
```

## Features

### Authentication
- JWT-based authentication
- Role-based access control (Admin, Doctor, Patient)
- Automatic token refresh
- Protected routes

### Theme Support
- Light/Dark mode toggle
- Theme preference saved in localStorage
- Smooth transitions

### User Roles

**Admin Dashboard:**
- View all doctors, patients, and appointments
- CRUD operations for doctors
- Manage patients and appointments

**Doctor Dashboard:**
- View assigned appointments
- Update appointment status
- Access patient history
- Create/update treatment records

**Patient Dashboard:**
- Browse doctors by specialization
- Book, reschedule, and cancel appointments
- View medical history
- Export medical history to CSV

## Development

Run the development server:
```bash
npm run dev
```

The app will hot-reload when you make changes.

## Default Credentials

Use these credentials to test the application:

**Admin:**
- Email: admin@syntura.com
- Password: admin123

**Doctor:**
- Email: rajesh.kumar@syntura.com
- Password: doctor123

**Patient:**
- Email: deepika.singh@email.com
- Password: patient123

## Notes

This is a working implementation demonstrating the integration between Vue.js frontend and Flask backend using Bootstrap for styling. The application implements:

- Complete authentication flow
- Role-based routing
- API integration with Axios
- Theme toggle (light/dark mode)
- Basic dashboards for all three roles
- Responsive design using Bootstrap 5
