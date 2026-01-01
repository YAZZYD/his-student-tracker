<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { Eye, Edit, Trash } from 'lucide-vue-next'
import type { StudentHeadInfo, StudentCode } from '@renderer/types/students'
import { computed } from 'vue'

const props = defineProps<{ student: StudentHeadInfo }>()
const emit = defineEmits<{
  (e: 'show', code: StudentCode): void
  (e: 'edit', student: StudentCode): void
  (e: 'delete', student: StudentCode): void
}>()

const gradeLabel = computed(() => {
  const map: Record<string, string> = {
    M1: 'Master 1',
    M2: 'Master 2',
    M3: 'Master 3',
    L1: 'Licence 1',
    L2: 'Licence 2',
    L3: 'Licence 3'
  }
  return map[props.student.grade.name] ?? props.student.grade.name
})
</script>

<template>
  <tr class="group border-b border-slate-700/30 hover:bg-slate-700/30 transition-all duration-150">
    <td class="px-6 py-4 text-slate-300 font-mono text-sm w-32">
      {{ props.student.code }}
    </td>
    <td class="px-6 py-4 text-slate-100 font-medium">
      {{ props.student.name }}
    </td>
    <td class="px-6 py-4 text-slate-300 text-sm">
      {{ props.student.email }}
    </td>
    <td class="px-6 py-4">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20"
      >
        {{ props.student.specialty.name }}
      </span>
    </td>
    <td class="px-6 py-4 w-32">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20"
      >
        {{ gradeLabel }}
      </span>
    </td>
    <td class="px-6 py-4 w-36">
      <div
        class="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
          title="View Details"
          @click="emit('show', props.student)"
        >
          <Eye class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
          title="Edit StudentHeadInfo"
          @click="emit('edit', props.student)"
        >
          <Edit class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Delete StudentHeadInfo"
          @click="emit('delete', props.student)"
        >
          <Trash class="h-4 w-4" />
        </Button>
      </div>
    </td>
  </tr>
</template>
