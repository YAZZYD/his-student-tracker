<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStudentData } from '@renderer/composables/useStudentData'
import StudentHeader from './components/StudentHeader.vue'
import RadarChart from './components/RadarChart.vue'
import SkillDetails from './components/SkillDetails.vue'
import EvaluationHistory from './components/EvaluationHistory.vue'
import Activities from './components/Activities.vue'
import Error from '@renderer/components/ui/error/Error.vue'
import Loading from '@renderer/components/ui/loading/Loading.vue'
import { Pencil } from 'lucide-vue-next'
import { router } from '@renderer/router/index'

const props = defineProps<{ code: string }>()
const {
  student,
  loading,
  error,
  softSkills,
  hardSkills,
  overallEvaluation,
  fetchStudent,
  age,
  softSkillsAverage,
  hardSkillsAverage,
  engagementScore,
  getDataPoints
} = useStudentData()

const metrics = computed(() => ({
  overallEvaluation: overallEvaluation.value,
  softSkillsAverage: softSkillsAverage.value,
  hardSkillsAverage: hardSkillsAverage.value,
  engagementScore: engagementScore.value,
  getDataPoints: getDataPoints.value,
  activitiesCount: student.value?.activities.length ?? 0
}))

const skills = computed(() => ({
  softSkills: softSkills.value,
  hardSkills: hardSkills.value
}))
onMounted(() => {
  fetchStudent(props.code)
})
</script>

<template>
  <div class="w-full max-w-6xl mx-auto p-6 space-y-6">
    <Loading v-if="loading" />

    <Error v-else-if="error" :error="error" />

    <!-- Content -->
    <template v-else-if="student">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <button
          class="text-slate-400 hover:text-slate-300 transition-colors text-sm"
          @click="router.push({ name: 'student-index' })"
        >
          ← Back
        </button>
        <div class="flex">
          <button
            variant="ghost"
            size="icon"
            class="group h-9 w-9 border border-transparent transition-all"
            title="Edit"
            @click="
              () => {
                router.replace({ name: 'student-edit', params: { code: student?.code } })
              }
            "
          >
            <Pencil class="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-400" />
          </button>
        </div>
      </div>

      <StudentHeader :student="student" :age="age" />
      <RadarChart :metrics="metrics" />
      <SkillDetails :skills="skills" />
      <Activities :student="student" />
      <EvaluationHistory :student="student" />
    </template>
  </div>
</template>
