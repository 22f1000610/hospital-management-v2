// Admin Dashboard JavaScript

// Sample data storage (in real app, this would be a database)
let doctors = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialization: "Cardiology",
        email: "sarah.j@hospital.com",
        phone: "555-0101",
        experience: 15,
        qualification: "MD, FACC"
    },
    {
        id: 2,
        name: "Dr. Michael Chen",
        specialization: "Neurology",
        email: "m.chen@hospital.com",
        phone: "555-0102",
        experience: 12,
        qualification: "MD, PhD"
    },
    {
        id: 3,
        name: "Dr. Emily Martinez",
        specialization: "Pediatrics",
        email: "emily.m@hospital.com",
        phone: "555-0103",
        experience: 8,
        qualification: "MD, FAAP"
    }
];

let patients = [
    {
        id: 1,
        name: "John Smith",
        age: 45,
        gender: "Male",
        email: "john.smith@email.com",
        phone: "555-0201",
        registrationDate: "2024-01-15"
    },
    {
        id: 2,
        name: "Mary Johnson",
        age: 32,
        gender: "Female",
        email: "mary.j@email.com",
        phone: "555-0202",
        registrationDate: "2024-02-20"
    },
    {
        id: 3,
        name: "Robert Davis",
        age: 58,
        gender: "Male",
        email: "r.davis@email.com",
        phone: "555-0203",
        registrationDate: "2024-03-10"
    }
];

let appointments = [
    {
        id: 1,
        patientName: "John Smith",
        doctorName: "Dr. Sarah Johnson",
        department: "Cardiology",
        date: "2024-11-20",
        time: "10:00 AM",
        status: "scheduled"
    },
    {
        id: 2,
        patientName: "Mary Johnson",
        doctorName: "Dr. Michael Chen",
        department: "Neurology",
        date: "2024-11-21",
        time: "2:00 PM",
        status: "scheduled"
    },
    {
        id: 3,
        patientName: "Robert Davis",
        doctorName: "Dr. Emily Martinez",
        department: "Pediatrics",
        date: "2024-11-19",
        time: "11:30 AM",
        status: "completed"
    }
];

// Initialize tables on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDoctorsTable();
    loadPatientsTable();
    loadAppointmentsTable();
    setupFormValidation();
});

// Load doctors table
function loadDoctorsTable() {
    const tbody = document.getElementById('doctorsTableBody');
    tbody.innerHTML = '';
    
    doctors.forEach(doctor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doctor.id}</td>
            <td>${doctor.name}</td>
            <td>${doctor.specialization}</td>
            <td>${doctor.email}</td>
            <td>${doctor.phone}</td>
            <td>${doctor.experience} years</td>
            <td>${doctor.qualification}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load patients table
function loadPatientsTable() {
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = '';
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.email}</td>
            <td>${patient.phone}</td>
            <td>${patient.registrationDate}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load appointments table
function loadAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTableBody');
    tbody.innerHTML = '';
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>${appointment.patientName}</td>
            <td>${appointment.doctorName}</td>
            <td>${appointment.department}</td>
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Form validation and submission
function setupFormValidation() {
    const form = document.getElementById('addDoctorForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Validate form
        let isValid = true;
        
        // Name validation
        const name = document.getElementById('doctorName').value.trim();
        if (name === '') {
            showError('doctorNameError', 'Doctor name is required');
            isValid = false;
        } else if (name.length < 3) {
            showError('doctorNameError', 'Name must be at least 3 characters');
            isValid = false;
        }
        
        // Email validation
        const email = document.getElementById('doctorEmail').value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === '') {
            showError('doctorEmailError', 'Email is required');
            isValid = false;
        } else if (!emailPattern.test(email)) {
            showError('doctorEmailError', 'Please enter a valid email');
            isValid = false;
        }
        
        // Phone validation
        const phone = document.getElementById('doctorPhone').value.trim();
        const phonePattern = /^[\d\s\-\(\)]+$/;
        if (phone === '') {
            showError('doctorPhoneError', 'Phone number is required');
            isValid = false;
        } else if (!phonePattern.test(phone) || phone.length < 10) {
            showError('doctorPhoneError', 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Specialization validation
        const specialization = document.getElementById('doctorSpecialization').value;
        if (specialization === '') {
            showError('doctorSpecializationError', 'Please select a specialization');
            isValid = false;
        }
        
        // Experience validation
        const experience = document.getElementById('doctorExperience').value;
        if (experience === '' || experience < 0 || experience > 50) {
            showError('doctorExperienceError', 'Please enter valid years of experience (0-50)');
            isValid = false;
        }
        
        // Qualification validation
        const qualification = document.getElementById('doctorQualification').value.trim();
        if (qualification === '') {
            showError('doctorQualificationError', 'Qualification is required');
            isValid = false;
        }
        
        // If valid, add doctor
        if (isValid) {
            addDoctor({
                id: doctors.length + 1,
                name: name,
                specialization: specialization,
                email: email,
                phone: phone,
                experience: parseInt(experience),
                qualification: qualification
            });
            
            form.reset();
            showSuccess('Doctor added successfully!');
        }
    });
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

function showSuccess(message) {
    const successElement = document.getElementById('formSuccessMessage');
    successElement.textContent = message;
    successElement.classList.add('show');
    
    setTimeout(() => {
        successElement.classList.remove('show');
    }, 3000);
}

function addDoctor(doctor) {
    doctors.push(doctor);
    loadDoctorsTable();
    
    // Save to localStorage for persistence across pages
    localStorage.setItem('doctors', JSON.stringify(doctors));
}

// Load from localStorage if available
if (localStorage.getItem('doctors')) {
    try {
        const storedDoctors = JSON.parse(localStorage.getItem('doctors'));
        if (storedDoctors.length > 0) {
            doctors = storedDoctors;
        }
    } catch (e) {
        console.error('Error loading doctors from localStorage:', e);
    }
}

if (localStorage.getItem('patients')) {
    try {
        const storedPatients = JSON.parse(localStorage.getItem('patients'));
        if (storedPatients.length > 0) {
            patients = storedPatients;
        }
    } catch (e) {
        console.error('Error loading patients from localStorage:', e);
    }
}

if (localStorage.getItem('appointments')) {
    try {
        const storedAppointments = JSON.parse(localStorage.getItem('appointments'));
        if (storedAppointments.length > 0) {
            appointments = storedAppointments;
        }
    } catch (e) {
        console.error('Error loading appointments from localStorage:', e);
    }
}
