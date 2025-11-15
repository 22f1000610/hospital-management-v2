<template>
  <div>
    <Navbar />
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Patient Dashboard</h1>
        <p>Browse doctors, book appointments, and view your medical history</p>
      </div>

      <div class="alert alert-info">
        <strong>Note:</strong> This is a basic implementation. The full patient dashboard with doctor search, appointment booking, and medical history is being developed.
      </div>

      <!-- Departments -->
      <div class="card mb-4">
        <div class="card-body">
          <h3>Departments</h3>
          <div v-if="loadingDepartments" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else class="departments-grid">
            <div
              v-for="dept in departments"
              :key="dept.name"
              class="department-card"
            >
              <div class="department-icon">{{ dept.icon }}</div>
              <h5>{{ dept.name }}</h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Doctors -->
      <div class="card mb-4">
        <div class="card-body">
          <h3>Available Doctors</h3>
          <div v-if="loadingDoctors" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else-if="doctors.length > 0" class="row">
            <div v-for="doctor in doctors" :key="doctor.id" class="col-md-6 mb-3">
              <div class="doctor-card">
                <h5>{{ doctor.name }}</h5>
                <p class="mb-1">
                  <strong>Specialization:</strong> {{ doctor.specialization }}
                </p>
                <p class="mb-1">
                  <strong>Qualification:</strong> {{ doctor.qualification }}
                </p>
                <p class="mb-1">
                  <strong>Experience:</strong> {{ doctor.experience }} years
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-muted">No doctors available</p>
          </div>
        </div>
      </div>

      <!-- Medical History -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="mb-0">Medical History</h3>
            <button @click="exportHistory" class="btn btn-secondary" :disabled="exporting">
              <span v-if="exporting" class="spinner-border spinner-border-sm me-2"></span>
              📥 Export to CSV
            </button>
          </div>
          <div v-if="loadingHistory" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else-if="history.length > 0" class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Diagnosis</th>
                  <th>Prescription</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in history" :key="record.id">
                  <td>{{ record.visit_date }}</td>
                  <td>{{ record.doctor_name }}</td>
                  <td>{{ record.department }}</td>
                  <td>{{ record.diagnosis }}</td>
                  <td>{{ record.prescription }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-muted">No medical history found</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import api from '@/services/api'

const departments = ref([])
const doctors = ref([])
const history = ref([])
const loadingDepartments = ref(true)
const loadingDoctors = ref(true)
const loadingHistory = ref(true)
const exporting = ref(false)

onMounted(async () => {
  try {
    // Fetch departments
    const deptResponse = await api.patient.getDepartments()
    departments.value = deptResponse.data
  } catch (error) {
    console.error('Error fetching departments:', error)
  } finally {
    loadingDepartments.value = false
  }

  try {
    // Fetch doctors
    const doctorsResponse = await api.patient.getDoctors()
    doctors.value = doctorsResponse.data
  } catch (error) {
    console.error('Error fetching doctors:', error)
  } finally {
    loadingDoctors.value = false
  }

  try {
    // Fetch medical history
    const historyResponse = await api.patient.getMedicalHistory()
    history.value = historyResponse.data
  } catch (error) {
    console.error('Error fetching history:', error)
  } finally {
    loadingHistory.value = false
  }
})

const exportHistory = async () => {
  exporting.value = true
  try {
    const response = await api.patient.exportHistory()
    alert(`Export started! Task ID: ${response.data.task_id}`)
  } catch (error) {
    console.error('Error exporting history:', error)
    alert('Failed to export history')
  } finally {
    exporting.value = false
  }
}
</script>
