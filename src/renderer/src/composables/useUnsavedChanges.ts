import { ref, onMounted, onUnmounted, Ref } from 'vue'

export function useUnsavedChanges(): {
  hasUnsavedChanges: Ref<boolean, boolean>
  markDirty: () => void
  resetDirty: () => void
} {
  const hasUnsavedChanges = ref(false)

  const markDirty = (): void => {
    hasUnsavedChanges.value = true
  }

  const resetDirty = (): void => {
    hasUnsavedChanges.value = false
  }

  const beforeUnload = (e: BeforeUnloadEvent): void => {
    if (!hasUnsavedChanges.value) return
    e.preventDefault()
    e.returnValue = ''
  }

  onMounted(() => {
    window.addEventListener('beforeunload', beforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnload)
  })

  return { hasUnsavedChanges, markDirty, resetDirty }
}
