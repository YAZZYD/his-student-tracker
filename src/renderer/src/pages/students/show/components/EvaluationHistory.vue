<script setup lang="ts">
import { getEvaluationColor, formatDate } from '@renderer/lib/format.utils'
import { StudentWithRelations } from '@renderer/types/models'

interface Props {
  student: StudentWithRelations
}

//eslint-disable-next-line
const props = defineProps<Props>()
</script>
<template>
  <!-- Evaluation History -->
  <div
    v-if="student.evaluations.length"
    class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5"
  >
    <h3 class="text-sm font-semibold text-slate-300 mb-4">Evaluation History</h3>
    <div class="space-y-3">
      <div
        v-for="evaluation in student.evaluations"
        :key="evaluation.id"
        class="border border-slate-700/30 rounded p-3 hover:border-slate-600/50 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-slate-400">{{
            formatDate(evaluation.createdAt.toString())
          }}</span>
          <span class="text-xs font-semibold text-amber-400">
            {{
              (() => {
                const validScores = evaluation.skillEvaluations
                  .map((sr) => sr.score)
                  .filter((score): score is number => score != null)

                return validScores.length
                  ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
                  : 0
              })()
            }}
          </span>
        </div>
        <p v-if="evaluation.comment" class="text-xs text-slate-300 mb-2 italic">
          "{{ evaluation.comment }}"
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="sr in evaluation.skillEvaluations"
            :key="sr.skill.id"
            class="px-2 py-0.5 text-[10px] font-medium rounded border"
            :style="{
              borderColor: getEvaluationColor(sr.score),
              color: getEvaluationColor(sr.score),
              backgroundColor: getEvaluationColor(sr.score) + '15'
            }"
          >
            {{ sr.skill.name }}: {{ sr.score }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
