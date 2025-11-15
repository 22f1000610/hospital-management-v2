<template>
  <div>
    <Navbar />
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">Patient Registration</h2>

              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>

              <div v-if="successMessage" class="alert alert-success" role="alert">
                {{ successMessage }}
                <router-link to="/login">Click here to login</router-link>
              </div>

              <form @submit.prevent="handleRegister" v-if="!successMessage">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="name" class="form-label">Full Name *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      v-model="formData.name"
                      required
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email *</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="formData.email"
                      required
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="password" class="form-label">Password *</label>
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      v-model="formData.password"
                      required
                      minlength="6"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="phone" class="form-label">Phone *</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      v-model="formData.phone"
                      required
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="age" class="form-label">Age *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="age"
                      v-model.number="formData.age"
                      required
                      min="0"
                      max="150"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="gender" class="form-label">Gender *</label>
                    <select class="form-select" id="gender" v-model="formData.gender" required>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Registering...' : 'Register' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <p class="mb-0">
                  Already have an account?
                  <router-link to="/login">Login</router-link>
                </p>
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
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'

const authStore = useAuthStore()

const formData = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  age: '',
  gender: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const result = await authStore.register(formData.value)

  loading.value = false

  if (result.success) {
    successMessage.value = 'Registration successful! '
    formData.value = {
      name: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      gender: ''
    }
  } else {
    errorMessage.value = result.error
  }
}
</script>
