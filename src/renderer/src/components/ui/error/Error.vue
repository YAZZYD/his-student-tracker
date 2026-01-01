<script setup lang="ts">
interface Props {
  error: string | null
}

//eslint-disable-next-line
const props = defineProps<Props>()
</script>
<template>
  <!-- Error -->
  <div class="flex items-center justify-center py-20">
    <div class="bg-red-950/20 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
      <p class="text-red-400 text-sm">{{ error }}</p>
    </div>
  </div>
</template>
