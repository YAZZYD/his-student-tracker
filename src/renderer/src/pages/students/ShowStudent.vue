<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStudentData } from '@renderer/composables/useStudentData'
import StudentHeader from '@renderer/pages/students/components/show/StudentHeader.vue'
import RadarChart from '@renderer/pages/students/components/show/RadarChart.vue'
import SkillDetails from '@renderer/pages/students/components/show/SkillDetails.vue'
import RatingHistory from './components/show/RatingHistory.vue'
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
  overallRating,
  fetchStudent,
  age,
  softSkillsAverage,
  hardSkillsAverage,
  engagementScore,
  getDataPoints
} = useStudentData()

const metrics = computed(() => ({
  overallRating: overallRating.value,
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
          <Button
            variant="ghost"
            size="icon"
            class="group h-9 w-9 border border-transparent transition-all"
            title="Edit"
          >
            <Pencil class="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-400" />
          </Button>
        </div>
      </div>

      <StudentHeader :student="student" :age="age" />
      <RadarChart :metrics="metrics" />
      <SkillDetails :skills="skills" />
      <Activities :student="student" />
      <RatingHistory :student="student" />
    </template>
  </div>
</template>
