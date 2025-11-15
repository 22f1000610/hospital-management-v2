/**
 * API service using Axios
 */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          })

          const { access_token } = response.data
          localStorage.setItem('access_token', access_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default {
  // Auth
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },

  register(userData) {
    return apiClient.post('/auth/register', userData)
  },

  getCurrentUser() {
    return apiClient.get('/auth/me')
  },

  // Admin
  admin: {
    getDoctors() {
      return apiClient.get('/admin/doctors')
    },
    createDoctor(doctor) {
      return apiClient.post('/admin/doctors', doctor)
    },
    updateDoctor(id, doctor) {
      return apiClient.put(`/admin/doctors/${id}`, doctor)
    },
    deleteDoctor(id) {
      return apiClient.delete(`/admin/doctors/${id}`)
    },
    getPatients() {
      return apiClient.get('/admin/patients')
    },
    updatePatient(id, patient) {
      return apiClient.put(`/admin/patients/${id}`, patient)
    },
    deletePatient(id) {
      return apiClient.delete(`/admin/patients/${id}`)
    },
    getAppointments() {
      return apiClient.get('/admin/appointments')
    }
  },

  // Doctor
  doctor: {
    getAppointments(params) {
      return apiClient.get('/doctor/appointments', { params })
    },
    updateAppointmentStatus(id, status) {
      return apiClient.put(`/doctor/appointments/${id}/status`, { status })
    },
    getAssignedPatients() {
      return apiClient.get('/doctor/patients')
    },
    getPatientHistory(patientId) {
      return apiClient.get(`/doctor/patients/${patientId}/history`)
    },
    createTreatment(treatment) {
      return apiClient.post('/doctor/treatments', treatment)
    },
    updateTreatment(id, treatment) {
      return apiClient.put(`/doctor/treatments/${id}`, treatment)
    },
    getProfile() {
      return apiClient.get('/doctor/profile')
    },
    updateProfile(profile) {
      return apiClient.put('/doctor/profile', profile)
    }
  },

  // Patient
  patient: {
    getDoctors(params) {
      return apiClient.get('/patient/doctors', { params })
    },
    getDepartments() {
      return apiClient.get('/patient/departments')
    },
    getAppointments(params) {
      return apiClient.get('/patient/appointments', { params })
    },
    bookAppointment(appointment) {
      return apiClient.post('/patient/appointments', appointment)
    },
    rescheduleAppointment(id, appointment) {
      return apiClient.put(`/patient/appointments/${id}`, appointment)
    },
    cancelAppointment(id) {
      return apiClient.delete(`/patient/appointments/${id}`)
    },
    getMedicalHistory() {
      return apiClient.get('/patient/history')
    },
    getProfile() {
      return apiClient.get('/patient/profile')
    },
    updateProfile(profile) {
      return apiClient.put('/patient/profile', profile)
    },
    exportHistory() {
      return apiClient.post('/tasks/export-history')
    },
    getExportStatus(taskId) {
      return apiClient.get(`/tasks/export-history/${taskId}`)
    }
  }
}
