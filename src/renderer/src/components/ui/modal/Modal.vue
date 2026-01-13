<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  width?: string
}

//eslint-disable-next-line
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const close = (): void => emit('close')
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="close"
    >
      <div
        :style="{ width: width || '400px' }"
        class="bg-slate-900 rounded-lg shadow-lg overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h3 class="text-sm font-semibold text-white">{{ title || 'Modal' }}</h3>
          <button
            type="button"
            class="text-slate-400 hover:text-white transition-colors"
            @click="close"
          >
            ✕
          </button>
        </div>

        <div class="px-4 py-4 text-sm text-slate-200">
          <slot />
        </div>

        <div class="px-4 py-3 border-t border-slate-700 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
