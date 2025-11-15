<template>
  <div>
    <Navbar />
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage doctors, patients, and appointments</p>
      </div>

      <div class="alert alert-info">
        <strong>Note:</strong> This is a basic implementation. The full admin dashboard with all CRUD operations for doctors, patients, and appointments is being developed.
      </div>

      <div class="row">
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body text-center">
              <h3>Doctors</h3>
              <p class="display-6">{{ doctorsCount }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body text-center">
              <h3>Patients</h3>
              <p class="display-6">{{ patientsCount }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body text-center">
              <h3>Appointments</h3>
              <p class="display-6">{{ appointmentsCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-body">
          <h3>Registered Doctors</h3>
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else-if="doctors.length > 0" class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Experience</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doctor in doctors" :key="doctor.id">
                  <td>{{ doctor.id }}</td>
                  <td>{{ doctor.name }}</td>
                  <td>{{ doctor.specialization }}</td>
                  <td>{{ doctor.email }}</td>
                  <td>{{ doctor.experience }} years</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-muted">No doctors found</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Navbar from '@/components/Navbar.vue'
import api from '@/services/api'

const doctors = ref([])
const patients = ref([])
const appointments = ref([])
const loading = ref(true)

const doctorsCount = computed(() => doctors.value.length)
const patientsCount = computed(() => patients.value.length)
const appointmentsCount = computed(() => appointments.value.length)

onMounted(async () => {
  try {
    const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
      api.admin.getDoctors(),
      api.admin.getPatients(),
      api.admin.getAppointments()
    ])

    doctors.value = doctorsRes.data
    patients.value = patientsRes.data
    appointments.value = appointmentsRes.data
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
})
</script>
