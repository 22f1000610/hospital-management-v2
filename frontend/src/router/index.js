import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/doctor',
      name: 'doctor',
      component: () => import('../views/DoctorDashboard.vue'),
      meta: { requiresAuth: true, role: 'doctor' }
    },
    {
      path: '/patient',
      name: 'patient',
      component: () => import('../views/PatientDashboard.vue'),
      meta: { requiresAuth: true, role: 'patient' }
    }
  ]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
    } else if (to.meta.role && authStore.userRole !== to.meta.role) {
      // Redirect to appropriate dashboard based on role
      if (authStore.isAdmin) {
        next({ name: 'admin' })
      } else if (authStore.isDoctor) {
        next({ name: 'doctor' })
      } else if (authStore.isPatient) {
        next({ name: 'patient' })
      } else {
        next({ name: 'home' })
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
