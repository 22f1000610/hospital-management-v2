<template>
  <nav class="navbar navbar-expand-lg navbar-light sticky-top">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        SYNTURA{{ roleText }}
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <button @click="toggleTheme" class="btn theme-toggle" aria-label="Toggle theme">
              <span>{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
            </button>
          </li>
          <li v-if="authStore.isAuthenticated" class="nav-item">
            <router-link to="/" class="nav-link">
              ← Back to Home
            </router-link>
          </li>
          <li v-if="authStore.isAuthenticated" class="nav-item">
            <button @click="logout" class="btn btn-outline-danger btn-sm ms-2">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const roleText = computed(() => {
  if (authStore.isAdmin) return ' - Admin'
  if (authStore.isDoctor) return ' - Doctor'
  if (authStore.isPatient) return ' - Patient'
  return ''
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  box-shadow: var(--shadow);
}

.theme-toggle {
  padding: 0.5rem;
}
</style>
