<script setup lang="ts">
import '@renderer/assets/main.css'
import { useAuth } from '@renderer/stores/auth'
import NavBar from '@renderer/components/ui/navbar/NavBar.vue'

const auth = useAuth()
</script>

<template>
  <div class="main-layout flex flex-col min-h-screen">
    <div class="main-layout-overlay flex-1 flex flex-col overflow-auto">
      <NavBar v-if="auth.isAuthenticated" />

      <main class="flex-1 flex items-center justify-center">
        <router-view />
      </main>

      <!-- Footer -->
      <footer
        class="bg-slate-800/40 backdrop-blur-sm border-t border-slate-700/50 text-slate-400 text-sm p-4 text-center"
      >
        IYB &copy; {{ new Date().getFullYear() }}
      </footer>
    </div>
  </div>
</template>
