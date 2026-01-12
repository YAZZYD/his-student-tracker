<script setup lang="ts">
import { useToast } from '@renderer/composables/useToast'

const { toastMessage, toastType, toastVisible } = useToast()
</script>

<template>
  <RouterView />

  <!-- GLOBAL TOAST -->
  <transition name="toast">
    <div
      v-if="toastVisible"
      class="fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-2xl text-sm backdrop-blur-sm border"
      :class="{
        'bg-green-950/90 border-green-500/40 text-green-300': toastType === 'success',
        'bg-red-950/90 border-red-500/40 text-red-300': toastType === 'error',
        'bg-blue-950/90 border-blue-500/40 text-blue-300': toastType === 'info'
      }"
    >
      {{ toastMessage }}
    </div>
  </transition>
</template>
