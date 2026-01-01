import { defineStore } from 'pinia'

export const useAuth = defineStore('auth', {
  persist: true,
  state: () => ({
    username: null as string | null
  }),
  getters: {
    isAuthenticated: (state) => !!state.username
  },
  actions: {
    login(username: string) {
      this.username = username
    },
    logout() {
      this.username = null
    }
  }
})
