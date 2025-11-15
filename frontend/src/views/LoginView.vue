<template>
  <div>
    <Navbar />
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">Login</h2>

              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="credentials.email"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="credentials.password"
                    required
                  />
                </div>

                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <p class="mb-0">
                  Don't have an account?
                  <router-link to="/register">Register as Patient</router-link>
                </p>
              </div>

              <div class="mt-4 pt-3 border-top">
                <h6 class="text-muted">Demo Credentials:</h6>
                <small class="d-block">Admin: admin@syntura.com / admin123</small>
                <small class="d-block">Doctor: rajesh.kumar@syntura.com / doctor123</small>
                <small class="d-block">Patient: deepika.singh@email.com / patient123</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  const result = await authStore.login(credentials.value)

  loading.value = false

  if (result.success) {
    // Redirect based on role
    if (result.user.role === 'admin') {
      router.push('/admin')
    } else if (result.user.role === 'doctor') {
      router.push('/doctor')
    } else if (result.user.role === 'patient') {
      router.push('/patient')
    } else {
      router.push('/')
    }
  } else {
    errorMessage.value = result.error
  }
}
</script>
