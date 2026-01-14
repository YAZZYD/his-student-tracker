<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useStudentData } from '@renderer/composables/useStudentData'
import { useUnsavedChanges } from '@renderer/composables/useUnsavedChanges'
import Error from '@renderer/components/ui/error/Error.vue'
import Loading from '@renderer/components/ui/loading/Loading.vue'

import InfoTab from '../tabs/Info.vue'

// ─────────────────────────────
// routing
const router = useRouter()

// ─────────────────────────────
// data - no fetching, start with empty student
// ─────────────────────────────
const { student, initStudent, loading, error } = useStudentData()

// ─────────────────────────────
// unsaved changes handling
// ─────────────────────────────
const { hasUnsavedChanges, markDirty, resetDirty } = useUnsavedChanges()

// ─────────────────────────────
// lifecycle - initialize empty student
// ─────────────────────────────

onMounted(() => initStudent())
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
              @click="router.push({ name: 'student-index' })"
            >
              ← Back to Students
            </button>
            <div class="h-4 w-px bg-slate-700"></div>
            <div>
              <h1 class="text-lg font-semibold text-white">Create New Student</h1>
              <p class="text-xs text-slate-400">Fill in the required information</p>
            </div>
          </div>

          <div v-if="hasUnsavedChanges" class="flex items-center gap-2 text-amber-400 text-xs">
            <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            Unsaved changes
          </div>
        </div>

        <!-- Content - Only Info Tab for Creation -->
        <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
          <div class="p-10">
            <InfoTab
              :student="student"
              :has-unsaved-changes="hasUnsavedChanges"
              :is-create-mode="true"
              @dirty="markDirty"
              @saved="resetDirty"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
