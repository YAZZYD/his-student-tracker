<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { Eye, Edit, Trash } from 'lucide-vue-next'
import type { StudentHeadInfo, StudentCode } from '@renderer/types/models'
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
  <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
    <td class="px-4 py-3 text-slate-400 font-mono text-xs">
      {{ props.student.code }}
    </td>
    <td class="px-4 py-3 text-slate-200 font-medium text-sm">
      {{ props.student.name }}
    </td>
    <td class="px-4 py-3 text-slate-400 text-sm">
      {{ props.student.email }}
    </td>
    <td class="px-4 py-3">
      <span class="inline-block px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 text-xs">
        {{ props.student.specialty.name }}
      </span>
    </td>
    <td class="px-4 py-3">
      <span class="inline-block px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 text-xs">
        {{ gradeLabel }}
      </span>
    </td>
    <td class="px-4 py-3">
      <div class="flex gap-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
          title="View"
          @click="emit('show', props.student)"
        >
          <Eye class="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
          title="Edit"
          @click="emit('edit', props.student)"
        >
          <Edit class="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-slate-700/50"
          title="Delete"
          @click="emit('delete', props.student)"
        >
          <Trash class="h-3.5 w-3.5" />
        </Button>
      </div>
    </td>
  </tr>
</template>
