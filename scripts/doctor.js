// Doctor Dashboard JavaScript

// Sample data
let appointments = [
    {
        time: "09:00 AM",
        patientName: "John Smith",
        age: 45,
        contact: "555-0201",
        reason: "Regular checkup",
        status: "scheduled"
    },
    {
        time: "10:30 AM",
        patientName: "Mary Johnson",
        age: 32,
        contact: "555-0202",
        reason: "Follow-up consultation",
        status: "scheduled"
    },
    {
        time: "02:00 PM",
        patientName: "Robert Davis",
        age: 58,
        contact: "555-0203",
        reason: "New symptoms",
        status: "scheduled"
    }
];

let assignedPatients = [
    {
        id: "P001",
        name: "John Smith",
        age: 45,
        gender: "Male",
        lastVisit: "2024-11-10",
        condition: "Hypertension"
    },
    {
        id: "P002",
        name: "Mary Johnson",
        age: 32,
        gender: "Female",
        lastVisit: "2024-11-08",
        condition: "Migraine"
    },
    {
        id: "P003",
        name: "Robert Davis",
        age: 58,
        gender: "Male",
        lastVisit: "2024-11-05",
        condition: "Diabetes Type 2"
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAppointmentsTable();
    loadAssignedPatientsTable();
    populatePatientSelect();
    setupUpdateHistoryForm();
    generateTimeSlots();
    setDefaultDate();
});

// Load appointments table
function loadAppointmentsTable() {
    const tbody = document.getElementById('doctorAppointmentsTableBody');
    tbody.innerHTML = '';
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.time}</td>
            <td>${appointment.patientName}</td>
            <td>${appointment.age}</td>
            <td>${appointment.contact}</td>
            <td>${appointment.reason}</td>
            <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
            <td><button class="btn btn-success" onclick="markComplete('${appointment.patientName}')">Complete</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Load assigned patients table
function loadAssignedPatientsTable() {
    const tbody = document.getElementById('assignedPatientsTableBody');
    tbody.innerHTML = '';
    
    assignedPatients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.lastVisit}</td>
            <td>${patient.condition}</td>
            <td><button class="btn btn-success" onclick="selectPatient('${patient.name}')">Update</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Populate patient select dropdown
function populatePatientSelect() {
    const select = document.getElementById('patientSelect');
    
    assignedPatients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.name;
        option.textContent = `${patient.name} (${patient.id})`;
        select.appendChild(option);
    });
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('visitDate').value = today;
    document.getElementById('availabilityDate').value = today;
}

// Select patient for updating
function selectPatient(patientName) {
    document.getElementById('patientSelect').value = patientName;
    document.getElementById('patientSelect').focus();
    
    // Scroll to form
    document.getElementById('updatePatientHistoryForm').scrollIntoView({ behavior: 'smooth' });
}

// Mark appointment as complete
function markComplete(patientName) {
    const appointment = appointments.find(a => a.patientName === patientName);
    if (appointment) {
        appointment.status = 'completed';
        loadAppointmentsTable();
        alert(`Appointment for ${patientName} marked as completed`);
    }
}

// Setup update history form validation
function setupUpdateHistoryForm() {
    const form = document.getElementById('updatePatientHistoryForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        let isValid = true;
        
        // Validate patient selection
        const patient = document.getElementById('patientSelect').value;
        if (patient === '') {
            showError('patientSelectError', 'Please select a patient');
            isValid = false;
        }
        
        // Validate visit date
        const visitDate = document.getElementById('visitDate').value;
        if (visitDate === '') {
            showError('visitDateError', 'Visit date is required');
            isValid = false;
        }
        
        // Validate symptoms
        const symptoms = document.getElementById('symptoms').value.trim();
        if (symptoms === '') {
            showError('symptomsError', 'Symptoms are required');
            isValid = false;
        } else if (symptoms.length < 10) {
            showError('symptomsError', 'Please provide more detailed symptoms (at least 10 characters)');
            isValid = false;
        }
        
        // Validate diagnosis
        const diagnosis = document.getElementById('diagnosis').value.trim();
        if (diagnosis === '') {
            showError('diagnosisError', 'Diagnosis is required');
            isValid = false;
        } else if (diagnosis.length < 10) {
            showError('diagnosisError', 'Please provide a detailed diagnosis (at least 10 characters)');
            isValid = false;
        }
        
        // Validate prescription
        const prescription = document.getElementById('prescription').value.trim();
        if (prescription === '') {
            showError('prescriptionError', 'Prescription is required');
            isValid = false;
        } else if (prescription.length < 10) {
            showError('prescriptionError', 'Please provide detailed prescription (at least 10 characters)');
            isValid = false;
        }
        
        if (isValid) {
            // Save patient history
            const historyData = {
                patient: patient,
                visitDate: visitDate,
                symptoms: symptoms,
                diagnosis: diagnosis,
                prescription: prescription,
                followUpDate: document.getElementById('followUpDate').value,
                notes: document.getElementById('notes').value
            };
            
            savePatientHistory(historyData);
            form.reset();
            setDefaultDate();
            showSuccessMessage('Patient history updated successfully!');
        }
    });
}

function savePatientHistory(data) {
    // Get existing history from localStorage
    let history = [];
    if (localStorage.getItem('patientHistory')) {
        try {
            history = JSON.parse(localStorage.getItem('patientHistory'));
        } catch (e) {
            console.error('Error loading patient history:', e);
        }
    }
    
    // Add new entry
    history.push(data);
    
    // Save back to localStorage
    localStorage.setItem('patientHistory', JSON.stringify(history));
}

function showSuccessMessage(message) {
    const successElement = document.getElementById('historyFormSuccessMessage');
    successElement.textContent = message;
    successElement.classList.add('show');
    
    setTimeout(() => {
        successElement.classList.remove('show');
    }, 3000);
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

// Generate time slots for availability calendar
function generateTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    grid.innerHTML = '';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    
    // Create day headers
    const headerRow = document.createElement('div');
    headerRow.style.display = 'contents';
    
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.style.gridColumn = 'span 1';
        dayHeader.style.fontWeight = '600';
        dayHeader.style.padding = '1rem';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.backgroundColor = 'var(--light-bg)';
        dayHeader.style.borderRadius = '6px';
        dayHeader.style.marginBottom = '0.5rem';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });
    
    // Create time slots for each day
    days.forEach((day, dayIndex) => {
        const dayColumn = document.createElement('div');
        dayColumn.style.display = 'flex';
        dayColumn.style.flexDirection = 'column';
        dayColumn.style.gap = '0.5rem';
        
        timeSlots.forEach((time, timeIndex) => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            
            // Randomly assign availability status for demo
            const random = Math.random();
            if (random < 0.6) {
                slot.classList.add('available');
            } else if (random < 0.8) {
                slot.classList.add('booked');
            } else {
                slot.classList.add('unavailable');
            }
            
            slot.addEventListener('click', function() {
                if (slot.classList.contains('available')) {
                    slot.classList.remove('available');
                    slot.classList.add('unavailable');
                } else if (slot.classList.contains('unavailable')) {
                    slot.classList.remove('unavailable');
                    slot.classList.add('available');
                }
            });
            
            dayColumn.appendChild(slot);
        });
        
        grid.appendChild(dayColumn);
    });
}
