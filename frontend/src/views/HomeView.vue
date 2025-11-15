<template>
  <div>
    <Navbar />
    <div class="container">
      <div class="welcome-section">
        <h1>SYNTURA Hospital Management System</h1>
        <p class="lead">Select your role to continue</p>

        <div class="role-cards">
          <div class="role-card">
            <div class="card-icon">👨‍⚕️</div>
            <h2>Admin</h2>
            <p>Manage doctors, patients, and appointments</p>
            <router-link v-if="authStore.isAuthenticated && authStore.isAdmin" to="/admin" class="btn btn-primary">
              Go to Admin Dashboard
            </router-link>
            <router-link v-else to="/login" class="btn btn-primary">
              Login as Admin
            </router-link>
          </div>

          <div class="role-card">
            <div class="card-icon">🩺</div>
            <h2>Doctor</h2>
            <p>View appointments, update patient records</p>
            <router-link v-if="authStore.isAuthenticated && authStore.isDoctor" to="/doctor" class="btn btn-primary">
              Go to Doctor Dashboard
            </router-link>
            <router-link v-else to="/login" class="btn btn-primary">
              Login as Doctor
            </router-link>
          </div>

          <div class="role-card">
            <div class="card-icon">🏥</div>
            <h2>Patient</h2>
            <p>Browse doctors, book appointments, view history</p>
            <router-link v-if="authStore.isAuthenticated && authStore.isPatient" to="/patient" class="btn btn-primary">
              Go to Patient Dashboard
            </router-link>
            <div v-else>
              <router-link to="/login" class="btn btn-primary me-2">
                Login
              </router-link>
              <router-link to="/register" class="btn btn-outline-primary">
                Register
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
