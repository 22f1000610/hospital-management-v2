/**
 * Authentication store using Pinia
 */
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    isAuthenticated: !!localStorage.getItem('access_token')
  }),

  getters: {
    userRole: (state) => state.user?.role || null,
    userProfile: (state) => state.user?.profile || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isDoctor: (state) => state.user?.role === 'doctor',
    isPatient: (state) => state.user?.role === 'patient'
  },

  actions: {
    async login(credentials) {
      try {
        const response = await api.login(credentials)
        const { access_token, refresh_token, user } = response.data

        this.accessToken = access_token
        this.refreshToken = refresh_token
        this.user = user
        this.isAuthenticated = true

        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        localStorage.setItem('user', JSON.stringify(user))

        return { success: true, user }
      } catch (error) {
        console.error('Login error:', error)
        return {
          success: false,
          error: error.response?.data?.error || 'Login failed'
        }
      }
    },

    async register(userData) {
      try {
        const response = await api.register(userData)
        return { success: true, data: response.data }
      } catch (error) {
        console.error('Registration error:', error)
        return {
          success: false,
          error: error.response?.data?.error || 'Registration failed'
        }
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await api.getCurrentUser()
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        return { success: true, user: response.data }
      } catch (error) {
        console.error('Fetch user error:', error)
        return { success: false, error: error.response?.data?.error || 'Failed to fetch user' }
      }
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  }
})
