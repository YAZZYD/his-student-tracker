<script setup lang="ts">
import { useAuth } from '@renderer/stores/auth'
import { Button } from '@renderer/components/ui/button'
import { router } from '@renderer/router'
import { LogOut, User } from 'lucide-vue-next'

const auth = useAuth()

const handleLogout = (): void => {
  auth.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <header
    class="sticky top-0 z-50 h-16 w-full border-b border-slate-700/30 bg-slate-900/60 backdrop-blur-xl shadow-lg"
  >
    <div class="h-full w-full px-6 flex items-center justify-between">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <img
          src="@renderer/assets/his-logo.png"
          alt="HIS Logo"
          class="w-8 h-8 rounded-lg object-cover"
        />
        <div class="flex flex-col">
          <span class="text-slate-100 font-semibold text-sm leading-tight"> Student Portal </span>
          <span class="text-slate-400 text-xs leading-tight"> Management System </span>
        </div>
      </div>

      <!-- User Actions -->
      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50"
        >
          <User class="h-4 w-4 text-slate-400" />
          <span class="text-sm text-slate-300 font-medium">
            {{ auth.username }}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          @click="handleLogout"
          title="Logout"
        >
          <LogOut class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </header>
</template>
