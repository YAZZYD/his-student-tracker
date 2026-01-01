<script setup lang="ts">
import { getRatingColor, formatDate } from '@renderer/lib/format.utils'
import { StudentWithRelations } from '@renderer/types/students'

interface Props {
  student: StudentWithRelations
}

//eslint-disable-next-line
const props = defineProps<Props>()
</script>
<template>
  <!-- Rating History -->
  <div
    v-if="student.ratings.length"
    class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5"
  >
    <h3 class="text-sm font-semibold text-slate-300 mb-4">Rating History</h3>
    <div class="space-y-3">
      <div
        v-for="rating in student.ratings"
        :key="rating.id"
        class="border border-slate-700/30 rounded p-3 hover:border-slate-600/50 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-slate-400">{{ formatDate(rating.createdAt.toString()) }}</span>
          <span class="text-xs font-semibold text-amber-400">
            {{
              Math.round(
                rating.skillRatings.reduce((sum, sr) => sum + sr.score, 0) /
                  rating.skillRatings.length
              )
            }}
          </span>
        </div>
        <p v-if="rating.comments" class="text-xs text-slate-300 mb-2 italic">
          "{{ rating.comments }}"
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="sr in rating.skillRatings"
            :key="sr.skill.id"
            class="px-2 py-0.5 text-[10px] font-medium rounded border"
            :style="{
              borderColor: getRatingColor(sr.score),
              color: getRatingColor(sr.score),
              backgroundColor: getRatingColor(sr.score) + '15'
            }"
          >
            {{ sr.skill.name }}: {{ sr.score }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
