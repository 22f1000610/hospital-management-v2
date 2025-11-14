// Admin Dashboard JavaScript

// Sample data storage (in real app, this would be a database)
let doctors = [
    {
        id: 1,
        name: "Dr. Rajesh Kumar",
        specialization: "Cardiology",
        email: "rajesh.kumar@syntura.com",
        phone: "+91-667-1234-5678",
        experience: 15,
        qualification: "MD"
    },
    {
        id: 2,
        name: "Dr. Priya Sharma",
        specialization: "Neurology",
        email: "priya.sharma@syntura.com",
        phone: "+91-666-2345-6789",
        experience: 12,
        qualification: "DM"
    },
    {
        id: 3,
        name: "Dr. Anil Patel",
        specialization: "Pediatrics",
        email: "anil.patel@syntura.com",
        phone: "+91-667-3456-7890",
        experience: 8,
        qualification: "MBBS"
    }
];

let patients = [
    {
        id: 1,
        name: "Deepika Singh",
        age: 45,
        gender: "Female",
        email: "deepika.singh@email.com",
        phone: "+91-667-4567-8901",
        registrationDate: "2024-01-15"
    },
    {
        id: 2,
        name: "Arjun Verma",
        age: 32,
        gender: "Male",
        email: "arjun.verma@email.com",
        phone: "+91-666-5678-9012",
        registrationDate: "2024-02-20"
    },
    {
        id: 3,
        name: "Meera Reddy",
        age: 58,
        gender: "Female",
        email: "meera.reddy@email.com",
        phone: "+91-667-6789-0123",
        registrationDate: "2024-03-10"
    }
];

let appointments = [
    {
        id: 1,
        patientName: "Deepika Singh",
        doctorName: "Dr. Rajesh Kumar",
        department: "Cardiology",
        date: "2024-11-20",
        time: "10:00 AM",
        status: "scheduled"
    },
    {
        id: 2,
        patientName: "Arjun Verma",
        doctorName: "Dr. Priya Sharma",
        department: "Neurology",
        date: "2024-11-21",
        time: "2:00 PM",
        status: "scheduled"
    },
    {
        id: 3,
        patientName: "Meera Reddy",
        doctorName: "Dr. Anil Patel",
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
            <td><button class="btn btn-edit" onclick="openEditDoctorModal(${doctor.id})">Edit</button></td>
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
            <td><button class="btn btn-edit" onclick="openEditPatientModal(${patient.id})">Edit</button></td>
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
        
        // Phone validation (Indian format: +91-XXX-XXXX-XXXX)
        const phone = document.getElementById('doctorPhone').value.trim();
        const phonePattern = /^\+91-\d{3}-\d{4}-\d{4}$/;
        if (phone === '') {
            showError('doctorPhoneError', 'Phone number is required');
            isValid = false;
        } else if (!phonePattern.test(phone)) {
            showError('doctorPhoneError', 'Please enter in format: +91-XXX-XXXX-XXXX');
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

// ===== Edit Doctor Modal Functions =====
function openEditDoctorModal(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    document.getElementById('editDoctorId').value = doctor.id;
    document.getElementById('editDoctorName').value = doctor.name;
    document.getElementById('editDoctorEmail').value = doctor.email;
    document.getElementById('editDoctorPhone').value = doctor.phone;
    document.getElementById('editDoctorSpecialization').value = doctor.specialization;
    document.getElementById('editDoctorExperience').value = doctor.experience;
    document.getElementById('editDoctorQualification').value = doctor.qualification;
    
    document.getElementById('editDoctorModal').classList.add('show');
}

function closeEditDoctorModal() {
    document.getElementById('editDoctorModal').classList.remove('show');
}

// Edit doctor form submission
document.addEventListener('DOMContentLoaded', function() {
    const editDoctorForm = document.getElementById('editDoctorForm');
    if (editDoctorForm) {
        editDoctorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const doctorId = parseInt(document.getElementById('editDoctorId').value);
            const doctor = doctors.find(d => d.id === doctorId);
            
            if (doctor) {
                doctor.name = document.getElementById('editDoctorName').value.trim();
                doctor.email = document.getElementById('editDoctorEmail').value.trim();
                doctor.phone = document.getElementById('editDoctorPhone').value.trim();
                doctor.specialization = document.getElementById('editDoctorSpecialization').value;
                doctor.experience = parseInt(document.getElementById('editDoctorExperience').value);
                doctor.qualification = document.getElementById('editDoctorQualification').value;
                
                localStorage.setItem('doctors', JSON.stringify(doctors));
                loadDoctorsTable();
                closeEditDoctorModal();
                alert('Doctor information updated successfully!');
            }
        });
    }
});

// ===== Edit Patient Modal Functions =====
function openEditPatientModal(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    document.getElementById('editPatientId').value = patient.id;
    document.getElementById('editPatientName').value = patient.name;
    document.getElementById('editPatientAge').value = patient.age;
    document.getElementById('editPatientGender').value = patient.gender;
    document.getElementById('editPatientEmail').value = patient.email;
    document.getElementById('editPatientPhone').value = patient.phone;
    document.getElementById('editPatientRegistrationDate').value = patient.registrationDate;
    
    document.getElementById('editPatientModal').classList.add('show');
}

function closeEditPatientModal() {
    document.getElementById('editPatientModal').classList.remove('show');
}

// Edit patient form submission
document.addEventListener('DOMContentLoaded', function() {
    const editPatientForm = document.getElementById('editPatientForm');
    if (editPatientForm) {
        editPatientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const patientId = parseInt(document.getElementById('editPatientId').value);
            const patient = patients.find(p => p.id === patientId);
            
            if (patient) {
                patient.name = document.getElementById('editPatientName').value.trim();
                patient.age = parseInt(document.getElementById('editPatientAge').value);
                patient.gender = document.getElementById('editPatientGender').value;
                patient.email = document.getElementById('editPatientEmail').value.trim();
                patient.phone = document.getElementById('editPatientPhone').value.trim();
                patient.registrationDate = document.getElementById('editPatientRegistrationDate').value;
                
                localStorage.setItem('patients', JSON.stringify(patients));
                loadPatientsTable();
                closeEditPatientModal();
                alert('Patient information updated successfully!');
            }
        });
    }
});
