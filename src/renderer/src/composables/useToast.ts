// composables/useToast.ts
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

const toastMessage = ref<string | null>(null)
const toastType = ref<ToastType>('info')
const toastVisible = ref(false)

let timeout: number | null = null

export function useToast(): {
  toastMessage: typeof toastMessage
  toastType: typeof toastType
  toastVisible: typeof toastVisible
  showToast: (msg: string, type?: ToastType, duration?: number) => void
  hideToast: () => void
} {
  function showToast(msg: string, type: ToastType = 'info', duration = 3000): void {
    toastMessage.value = msg
    toastType.value = type
    toastVisible.value = true

    if (timeout) clearTimeout(timeout)

    timeout = window.setTimeout(() => {
      toastVisible.value = false
      timeout = null
    }, duration)
  }

  function hideToast(): void {
    toastVisible.value = false
  }

  return {
    toastMessage,
    toastType,
    toastVisible,
    showToast,
    hideToast
  }
}
