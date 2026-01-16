<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentData } from '@renderer/composables/useStudentData'
import { useUnsavedChanges } from '@renderer/composables/useUnsavedChanges'
import Error from '@renderer/components/ui/error/Error.vue'
import Loading from '@renderer/components/ui/loading/Loading.vue'
import InfoTab from '../tabs/Info.vue'
import ImportStudentsModal from './modals/ImportStudentModal.vue'
import { Upload } from 'lucide-vue-next'
import { useToast } from '@renderer/composables/useToast'

const router = useRouter()
const toast = useToast()
const { student, initStudent, loading, error } = useStudentData()
const { hasUnsavedChanges, markDirty, resetDirty } = useUnsavedChanges()

const showImportModal = ref(false)

const handleImported = (count: number): void => {
  toast.showToast(`Imported ${count} student`, 'success')
  router.push({ name: 'student-index' })
}

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
          <div class="flex items-center gap-3">
            <div v-if="hasUnsavedChanges" class="flex items-center gap-2 text-amber-400 text-xs">
              <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              Unsaved changes
            </div>
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-all border border-slate-600"
              @click="showImportModal = true"
            >
              <Upload :size="16" />
              Bulk Import
            </button>
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

    <ImportStudentsModal
      :show="showImportModal"
      @close="showImportModal = false"
      @imported="handleImported"
    />
  </div>
</template>
