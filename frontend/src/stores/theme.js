/**
 * Theme store for dark/light mode toggle
 */
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: localStorage.getItem('theme') === 'dark'
  }),

  getters: {
    currentTheme: (state) => (state.isDark ? 'dark' : 'light')
  },

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
      this.applyTheme()
    },

    applyTheme() {
      if (this.isDark) {
        document.body.classList.add('dark-theme')
      } else {
        document.body.classList.remove('dark-theme')
      }
    },

    initTheme() {
      this.applyTheme()
    }
  }
})
