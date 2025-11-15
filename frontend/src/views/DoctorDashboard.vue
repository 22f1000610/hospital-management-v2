<template>
  <div>
    <Navbar />
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Doctor Dashboard</h1>
        <p>Manage appointments and patient records</p>
      </div>

      <div class="alert alert-info">
        <strong>Note:</strong> This is a basic implementation. The full doctor dashboard with appointment management and treatment records is being developed.
      </div>

      <div class="card mt-4">
        <div class="card-body">
          <h3>Upcoming Appointments</h3>
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
          </div>
          <div v-else-if="appointments.length > 0" class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in appointments" :key="appointment.id">
                  <td>{{ appointment.appointment_date }}</td>
                  <td>{{ appointment.appointment_time }}</td>
                  <td>{{ appointment.patient_name }}</td>
                  <td>{{ appointment.reason || 'N/A' }}</td>
                  <td>
                    <span :class="`status-badge status-${appointment.status}`">
                      {{ appointment.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-muted">No appointments found</p>
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

const appointments = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.doctor.getAppointments()
    appointments.value = response.data
  } catch (error) {
    console.error('Error fetching appointments:', error)
  } finally {
    loading.value = false
  }
})
</script>
