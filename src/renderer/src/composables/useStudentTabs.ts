import { computed, WritableComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export type StudentTab = 'info' | 'activities' | 'skills' | 'evaluations'

const tabs = [
  { key: 'info', label: 'Basic Information' },
  { key: 'activities', label: 'Activities' },
  { key: 'skills', label: 'Skills Overview' },
  { key: 'evaluations', label: 'Evaluations' }
] as const

type Tabs = typeof tabs
export function useStudentTabs(hasUnsavedChanges: { value: boolean }): {
  tabs: Tabs
  activeTab: WritableComputedRef<StudentTab>
  switchTab: (tab: StudentTab) => void
} {
  const route = useRoute()
  const router = useRouter()

  const activeTab = computed<StudentTab>({
    get() {
      return (route.query.tab as StudentTab) ?? 'info'
    },
    set(tab) {
      router.replace({
        query: { ...route.query, tab }
      })
    }
  })

  const switchTab = (tab: StudentTab): void => {
    if (tab === activeTab.value) return

    if (hasUnsavedChanges.value) {
      const ok = confirm('Discard unsaved changes?')
      if (!ok) return
    }

    activeTab.value = tab
  }

  return { tabs, activeTab, switchTab }
}
