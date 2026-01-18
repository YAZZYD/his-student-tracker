<script setup lang="ts">
import { useAuth } from '@renderer/stores/auth'
import { Button } from '@renderer/components/ui/button'
import { router } from '@renderer/router'
import { LogOut, User, Users, Activity } from 'lucide-vue-next'
import { computed } from 'vue'

const auth = useAuth()

const handleLogout = (): void => {
  auth.logout()
  router.replace({ name: 'login' })
}

const currentRoute = computed(() => router.currentRoute.value.name)

const navigateTo = (routeName: string): void => {
  router.push({ name: routeName })
}
</script>

<template>
  <header
    class="sticky top-0 z-50 h-14 w-full border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm"
  >
    <div class="h-full w-full px-6 flex items-center justify-between">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <img src="@renderer/assets/his.png" alt="HIS Logo" class="w-7 h-7 rounded object-cover" />
        <div class="flex flex-col">
          <span class="text-slate-100 font-semibold text-sm leading-tight"> Student Portal </span>
          <span class="text-slate-500 text-xs leading-tight"> Tracking System </span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex items-center gap-1">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            currentRoute === 'students'
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          "
          @click="navigateTo('student-index')"
        >
          <Users class="h-4 w-4" />
          <span>Students</span>
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            currentRoute === 'activities'
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          "
          @click="navigateTo('activity-index')"
        >
          <Activity class="h-4 w-4" />
          <span>Activities</span>
        </button>
      </nav>

      <!-- User Actions -->
      <div class="flex items-center gap-3">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
        >
          <User class="h-3.5 w-3.5 text-slate-500" />
          <span class="text-sm text-slate-300">
            {{ auth.username }}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          @click="handleLogout"
          title="Logout"
        >
          <LogOut class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </header>
</template>
