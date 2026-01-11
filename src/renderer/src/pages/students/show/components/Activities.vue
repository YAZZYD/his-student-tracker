<script setup lang="ts">
import { activityTypeMap } from '@renderer/constants/activity.constants'
import { StudentWithRelations } from '@renderer/types/students'

interface Props {
  student: StudentWithRelations
}
//eslint-disable-next-line
const props = defineProps<Props>()
</script>

<template>
  <!-- Activities -->
  <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
    <h3 class="text-sm font-semibold text-slate-300 mb-4">
      Activities ({{ student.activities.length }})
    </h3>
    <div v-if="student.activities.length" class="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div
        v-for="activity in student.activities"
        :key="activity.id"
        class="border rounded p-3 hover:border-slate-600 transition-colors"
        :class="activityTypeMap[activity.type].color"
      >
        <div class="flex items-start justify-between mb-2">
          <span class="text-[10px] font-medium uppercase tracking-wide">{{ activity.type }}</span>
          <span class="text-base">{{ activityTypeMap[activity.type].icon }}</span>
        </div>
        <h4 class="text-xs font-medium text-white mb-1 line-clamp-1">{{ activity.name }}</h4>
        <p class="text-[10px] text-slate-400 line-clamp-2">{{ activity.description }}</p>
      </div>
    </div>
    <p v-else class="text-slate-500 text-xs">No activities</p>
  </div>
</template>
