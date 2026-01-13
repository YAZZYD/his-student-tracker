<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, onBeforeRouteLeave, useRouter } from 'vue-router'

import { useStudentData } from '@renderer/composables/useStudentData'
import { useUnsavedChanges } from '@renderer/composables/useUnsavedChanges'
import { useStudentTabs } from '@renderer/composables/useStudentTabs'
import Error from '@renderer/components/ui/error/Error.vue'
import Loading from '@renderer/components/ui/loading/Loading.vue'

import InfoTab from './tabs/Info.vue'
import ActivitiesTab from './tabs/Activities.vue'
import { Activity, EvaluationWithRelations } from '@renderer/types/models'
import SkillsTab from './tabs/Skills.vue'
import EvaluationsTab from './tabs/Evaluations.vue'

// ─────────────────────────────
// routing
const router = useRouter()
const route = useRoute()
const studentCode = route.params.code as string

// ─────────────────────────────
// data
// ─────────────────────────────
const { student, fetchStudent, loading, error } = useStudentData()

// ─────────────────────────────
// unsaved changes handling
// ─────────────────────────────
const { hasUnsavedChanges, markDirty, resetDirty } = useUnsavedChanges()

// ─────────────────────────────
// tabs logic (query-driven)
// ─────────────────────────────
const { tabs, activeTab, switchTab } = useStudentTabs(hasUnsavedChanges)

// ─────────────────────────────
// lifecycle
// ─────────────────────────────
onMounted(() => {
  fetchStudent(studentCode)
})

// ─────────────────────────────
// route leave guard
// ─────────────────────────────
onBeforeRouteLeave(() => {
  if (!hasUnsavedChanges.value) return true
  return confirm('You have unsaved changes. Leave anyway?')
})

const onActivitiesUpdated = (activities: Activity[]): void => {
  if (!student.value) return
  student.value.activities = activities
}

const onSkillsUpdated = (newEvaluation: EvaluationWithRelations): void => {
  if (!student.value) return

  const existingIndex = student.value.evaluations.findIndex((r) => r.id === newEvaluation.id)

  if (existingIndex !== -1) {
    student.value.evaluations.splice(existingIndex, 1, newEvaluation)
  } else {
    student.value.evaluations = [newEvaluation, ...student.value.evaluations]
  }
}
</script>

<template>
  <div class="w-full max-w-6xl mx-auto p-6">
    <Loading v-if="loading" />

    <Error v-else-if="error" :error="error" />
    <template v-else-if="student">
      <div class="h-full flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button
              class="text-slate-400 hover:text-slate-300 transition-colors text-sm"
              type="button"
              @click="
                () => {
                  router.replace({ name: 'student-show', params: { code: student?.code } })
                }
              "
            >
              ← Back to Profile
            </button>
            <div class="h-4 w-px bg-slate-700"></div>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white"
              >
                {{ student.name.charAt(0) }}
              </div>
              <div>
                <h1 class="text-lg font-semibold text-white">{{ student.name }}</h1>
                <p class="text-xs text-slate-400 font-mono">{{ student.code }}</p>
              </div>
            </div>
          </div>

          <div v-if="hasUnsavedChanges" class="flex items-center gap-2 text-amber-400 text-xs">
            <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            Unsaved changes
          </div>
        </div>
        <!-- Tab Navigation -->
        <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg mb-6 overflow-hidden">
          <div class="flex border-b border-slate-700/50">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
              :class="
                activeTab === tab.key
                  ? 'text-blue-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
              "
              @click="switchTab(tab.key)"
            >
              {{ tab.label }}

              <div
                v-if="activeTab === tab.key"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            </button>
          </div>

          <!-- Tab Content -->
          <div class="flex-1 p-10 overflow-auto">
            <InfoTab
              v-if="activeTab === 'info'"
              :student="student"
              :has-unsaved-changes="hasUnsavedChanges"
              @dirty="markDirty"
              @saved="resetDirty"
            />

            <ActivitiesTab
              v-if="activeTab === 'activities'"
              :student-code="student.code"
              :student-activities="student.activities"
              :has-unsaved-changes="hasUnsavedChanges"
              @dirty="markDirty"
              @saved="resetDirty"
              @activities-updated="onActivitiesUpdated"
            />

            <SkillsTab
              v-if="activeTab === 'skills'"
              :student="student"
              :has-unsaved-changes="hasUnsavedChanges"
              @dirty="markDirty"
              @saved="resetDirty"
              @skill-evaluations-updated="onSkillsUpdated"
            />

            <EvaluationsTab v-if="activeTab === 'evaluations'" :student="student" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
