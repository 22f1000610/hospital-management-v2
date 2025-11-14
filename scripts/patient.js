// Patient Dashboard JavaScript

// Sample data
let departments = [
    { name: "Cardiology", icon: "❤️", doctorCount: 5 },
    { name: "Neurology", icon: "🧠", doctorCount: 4 },
    { name: "Orthopedics", icon: "🦴", doctorCount: 6 },
    { name: "Pediatrics", icon: "👶", doctorCount: 5 },
    { name: "Dermatology", icon: "✨", doctorCount: 3 },
    { name: "General Medicine", icon: "🏥", doctorCount: 8 }
];

let doctors = [
    {
        id: 1,
        name: "Dr. Rajesh Kumar",
        specialization: "Cardiology",
        experience: 15,
        qualification: "MD",
        email: "rajesh.kumar@syntura.com"
    },
    {
        id: 2,
        name: "Dr. Priya Sharma",
        specialization: "Neurology",
        experience: 12,
        qualification: "DM",
        email: "priya.sharma@syntura.com"
    },
    {
        id: 3,
        name: "Dr. Anil Patel",
        specialization: "Pediatrics",
        experience: 8,
        qualification: "MBBS",
        email: "anil.patel@syntura.com"
    },
    {
        id: 4,
        name: "Dr. Kavita Menon",
        specialization: "Orthopedics",
        experience: 20,
        qualification: "MS",
        email: "kavita.menon@syntura.com"
    },
    {
        id: 5,
        name: "Dr. Sanjay Gupta",
        specialization: "Dermatology",
        experience: 10,
        qualification: "MD",
        email: "sanjay.gupta@syntura.com"
    },
    {
        id: 6,
        name: "Dr. Ananya Iyer",
        specialization: "General Medicine",
        experience: 18,
        qualification: "MBBS",
        email: "ananya.iyer@syntura.com"
    }
];

let medicalHistory = [
    {
        date: "2024-11-10",
        doctor: "Dr. Rajesh Kumar",
        department: "Cardiology",
        diagnosis: "Mild hypertension",
        prescription: "Lisinopril 10mg daily, Low sodium diet",
        followUp: "2024-12-10"
    },
    {
        date: "2024-10-15",
        doctor: "Dr. Priya Sharma",
        department: "Neurology",
        diagnosis: "Tension headache",
        prescription: "Ibuprofen 400mg as needed, Stress management",
        followUp: "2024-11-15"
    },
    {
        date: "2024-09-20",
        doctor: "Dr. Ananya Iyer",
        department: "General Medicine",
        diagnosis: "Seasonal allergies",
        prescription: "Cetirizine 10mg daily, Nasal spray",
        followUp: "2024-10-20"
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDepartments();
    loadDoctors();
    loadMedicalHistory();
    setupFilters();
    setupExportButton();
    setDefaultDate();
    
    // Load from localStorage if available
    loadFromLocalStorage();
});

// Load departments grid
function loadDepartments() {
    const grid = document.getElementById('departmentsGrid');
    grid.innerHTML = '';
    
    departments.forEach(dept => {
        const card = document.createElement('div');
        card.className = `department-card ${dept.name.toLowerCase().replace(' ', '-')}`;
        card.innerHTML = `
            <div class="department-icon">${dept.icon}</div>
            <h3>${dept.name}</h3>
            <p>${dept.doctorCount} Doctors</p>
        `;
        card.addEventListener('click', () => filterDoctorsByDepartment(dept.name));
        grid.appendChild(card);
    });
}

// Load doctors list
function loadDoctors(filter = 'all') {
    const container = document.getElementById('doctorsList');
    container.innerHTML = '';
    
    let filteredDoctors = doctors;
    if (filter !== 'all') {
        filteredDoctors = doctors.filter(doc => doc.specialization === filter);
    }
    
    // Load additional doctors from localStorage if available
    if (localStorage.getItem('doctors')) {
        try {
            const storedDoctors = JSON.parse(localStorage.getItem('doctors'));
            // Merge with existing doctors, avoiding duplicates
            storedDoctors.forEach(storedDoc => {
                if (!doctors.find(d => d.email === storedDoc.email)) {
                    filteredDoctors.push(storedDoc);
                }
            });
        } catch (e) {
            console.error('Error loading doctors:', e);
        }
    }
    
    if (filteredDoctors.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No doctors found for this department.</p>';
        return;
    }
    
    filteredDoctors.forEach(doctor => {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.innerHTML = `
            <div class="doctor-info">
                <h3>${doctor.name}</h3>
                <p class="doctor-specialization">${doctor.specialization}</p>
                <p class="doctor-details">Experience: ${doctor.experience} years</p>
                <p class="doctor-details">Qualification: ${doctor.qualification}</p>
                <p class="doctor-details">Email: ${doctor.email}</p>
            </div>
            <button class="btn btn-primary" onclick="viewDoctorAvailability(${doctor.id}, '${doctor.name}')">View Availability</button>
        `;
        container.appendChild(card);
    });
}

// Filter doctors by department
function filterDoctorsByDepartment(department) {
    document.getElementById('departmentFilter').value = department;
    loadDoctors(department);
    
    // Scroll to doctors list
    document.querySelector('#doctorsList').scrollIntoView({ behavior: 'smooth' });
}

// Setup filter handlers
function setupFilters() {
    const departmentFilter = document.getElementById('departmentFilter');
    departmentFilter.addEventListener('change', function() {
        loadDoctors(this.value);
    });
    
    // Populate doctor select for calendar
    const doctorSelect = document.getElementById('doctorSelectCalendar');
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name;
        doctorSelect.appendChild(option);
    });
    
    doctorSelect.addEventListener('change', function() {
        if (this.value) {
            const selectedDoctor = doctors.find(d => d.id == this.value);
            generateAvailabilityCalendar(selectedDoctor);
        }
    });
}

// View doctor availability
function viewDoctorAvailability(doctorId, doctorName) {
    const doctorSelect = document.getElementById('doctorSelectCalendar');
    doctorSelect.value = doctorId;
    
    const selectedDoctor = doctors.find(d => d.id === doctorId);
    generateAvailabilityCalendar(selectedDoctor);
    
    // Scroll to calendar
    document.querySelector('#availabilityCalendar').scrollIntoView({ behavior: 'smooth' });
}

// Generate availability calendar with color-coded slots
function generateAvailabilityCalendar(doctor) {
    const container = document.getElementById('availabilityCalendar');
    container.innerHTML = '';
    
    const header = document.createElement('div');
    header.style.marginBottom = '1rem';
    header.innerHTML = `<h3>Availability for ${doctor.name}</h3>`;
    container.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'time-slots-grid';
    
    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];
    
    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        
        // Randomly assign availability for demo (color-coded)
        const random = Math.random();
        if (random < 0.5) {
            slot.classList.add('available');
            slot.style.cursor = 'pointer';
            slot.addEventListener('click', function() {
                bookAppointment(doctor, time);
            });
        } else if (random < 0.8) {
            slot.classList.add('booked');
        } else {
            slot.classList.add('unavailable');
        }
        
        grid.appendChild(slot);
    });
    
    container.appendChild(grid);
}

// Book appointment
function bookAppointment(doctor, time) {
    const confirmed = confirm(`Book appointment with ${doctor.name} at ${time}?`);
    if (confirmed) {
        alert(`Appointment booked successfully with ${doctor.name} at ${time}!`);
        // Refresh calendar to show booked slot
        generateAvailabilityCalendar(doctor);
    }
}

// Load medical history table
function loadMedicalHistory() {
    const tbody = document.getElementById('medicalHistoryTableBody');
    tbody.innerHTML = '';
    
    // Load from localStorage if available
    let historyData = medicalHistory;
    if (localStorage.getItem('patientHistory')) {
        try {
            const storedHistory = JSON.parse(localStorage.getItem('patientHistory'));
            // Convert doctor history to patient view
            storedHistory.forEach(entry => {
                historyData.push({
                    date: entry.visitDate,
                    doctor: entry.patient, // In real app, this would be the doctor's name
                    department: 'Various',
                    diagnosis: entry.diagnosis,
                    prescription: entry.prescription,
                    followUp: entry.followUpDate || 'N/A'
                });
            });
        } catch (e) {
            console.error('Error loading patient history:', e);
        }
    }
    
    historyData.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.doctor}</td>
            <td>${record.department}</td>
            <td>${record.diagnosis}</td>
            <td>${record.prescription}</td>
            <td>${record.followUp}</td>
        `;
        tbody.appendChild(row);
    });
}

// Export medical history to CSV
function setupExportButton() {
    const exportBtn = document.getElementById('exportCsvBtn');
    exportBtn.addEventListener('click', function() {
        exportToCSV();
    });
}

function exportToCSV() {
    const table = document.getElementById('medicalHistoryTable');
    let csv = [];
    
    // Get headers
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
    csv.push(headers.join(','));
    
    // Get data
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cols = Array.from(row.querySelectorAll('td')).map(td => {
            // Escape commas and quotes in data
            let data = td.textContent.replace(/"/g, '""');
            if (data.includes(',')) {
                data = `"${data}"`;
            }
            return data;
        });
        csv.push(cols.join(','));
    });
    
    // Create CSV file and download
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `medical_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Set default date
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('calendarDate').value = today;
}

// Load data from localStorage
function loadFromLocalStorage() {
    // This function is called on page load to sync with other dashboards
    if (localStorage.getItem('doctors')) {
        // Doctors are already loaded in loadDoctors function
        loadDoctors();
    }
}
