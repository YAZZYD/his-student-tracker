<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { activityTypeMap } from '@renderer/constants/activity.constants'
import { Edit, Trash } from 'lucide-vue-next'
import type { Activity } from '@renderer/types/models'

const props = defineProps<{ activity: Activity }>()

const emit = defineEmits<{
  (e: 'edit', activity: Activity): void
  (e: 'delete', activity: Activity): void
}>()
</script>

<template>
  <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
    <td class="px-6 py-3 text-slate-200 font-medium text-sm">
      {{ props.activity.name }}
    </td>
    <td class="px-6 py-3 text-slate-400 text-sm max-w-md">
      <div class="line-clamp-2">
        {{ props.activity.description }}
      </div>
    </td>
    <td class="px-6 py-3 text-center">
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium"
        :class="activityTypeMap[props.activity.type].color"
      >
        <span>{{ activityTypeMap[props.activity.type].icon }}</span>
        <span>{{ props.activity.type }}</span>
      </span>
    </td>
    <td class="px-6 py-3">
      <div class="flex gap-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
          title="Edit"
          @click="emit('edit', props.activity)"
        >
          <Edit class="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-slate-700/50"
          title="Delete"
          @click="emit('delete', props.activity)"
        >
          <Trash class="h-3.5 w-3.5" />
        </Button>
      </div>
    </td>
  </tr>
</template>
