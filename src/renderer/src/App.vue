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
      class="fixed top-5 right-5 z-50 px-4 py-3 rounded-md shadow-lg text-sm text-white"
      :class="{
        'bg-green-600': toastType === 'success',
        'bg-red-600': toastType === 'error',
        'bg-sky-600': toastType === 'info'
      }"
    >
      {{ toastMessage }}
    </div>
  </transition>
</template>
