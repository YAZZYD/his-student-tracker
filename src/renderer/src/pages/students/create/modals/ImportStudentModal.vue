<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from '@renderer/components/ui/modal/Modal.vue'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-vue-next'
import type { ResponseSchema as Response } from '@/schemas/response.schema'

interface ImportError {
  row: number
  field: string
  message: string
}

interface ImportResult {
  success: number
  failed: number
  errors: ImportError[]
}

interface Props {
  show: boolean
}
//eslint-disable-next-line
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported', count: number): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const importing = ref(false)
const importResult = ref<ImportResult | null>(null)
const dragOver = ref(false)

const acceptedFormats = ['.csv', '.xlsx', '.xls']

const hasErrors = computed(() => importResult.value && importResult.value.failed > 0)
const isComplete = computed(() => importResult.value !== null)

const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    importResult.value = null
  }
}

const handleDrop = (event: DragEvent): void => {
  dragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (isValidFile(file)) {
      selectedFile.value = file
      importResult.value = null
    }
  }
}

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault()
  dragOver.value = true
}

const handleDragLeave = (): void => {
  dragOver.value = false
}

const isValidFile = (file: File): boolean => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  return acceptedFormats.includes(extension)
}

const clearFile = (): void => {
  selectedFile.value = null
  importResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const importStudents = async (): Promise<void> => {
  if (!selectedFile.value) return

  importing.value = true
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Send file data and metadata to main process
    const res: Response = await window.api.student.importBulk({
      fileName: selectedFile.value.name,
      fileData: Array.from(buffer), // Convert Buffer to number array for IPC
      fileType: selectedFile.value.type
    })

    if (res.success) {
      importResult.value = res.data
      if (res.data.success > 0) {
        emit('imported', res.data.success)
      }
    }
  } catch (err) {
    console.error(err)
    importResult.value = {
      success: 0,
      failed: 1,
      errors: [{ row: 0, field: 'file', message: 'Failed to process file' }]
    }
  } finally {
    importing.value = false
  }
}

const downloadTemplate = async (): Promise<void> => {
  try {
    await window.api.student.downloadTemplate()
  } catch (err) {
    console.error('Failed to download template:', err)
  }
}

const handleClose = (): void => {
  if (!importing.value) {
    clearFile()
    emit('close')
  }
}

const reset = (): void => {
  clearFile()
  importResult.value = null
}
</script>

<template>
  <Modal :show="show" title="Import Students" width="600px" @close="handleClose">
    <div class="space-y-4">
      <!-- Template Download -->
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <FileSpreadsheet :size="20" class="text-blue-400 shrink-0 mt-0.5" />
          <div class="flex-1">
            <h4 class="text-sm font-medium text-blue-300 mb-1">Need a template?</h4>
            <p class="text-xs text-slate-400 mb-2">
              Download our template file to see the required format and columns.
            </p>
            <button
              type="button"
              class="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
              @click="downloadTemplate"
            >
              Download CSV Template
            </button>
          </div>
        </div>
      </div>

      <!-- File Upload Area -->
      <div v-if="!isComplete">
        <div
          class="border-2 border-dashed rounded-lg p-8 transition-all"
          :class="
            dragOver
              ? 'border-blue-500 bg-blue-500/5'
              : selectedFile
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
          "
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <input
            ref="fileInput"
            type="file"
            :accept="acceptedFormats.join(',')"
            class="hidden"
            @change="handleFileSelect"
          />

          <div v-if="!selectedFile" class="text-center">
            <Upload :size="32" class="mx-auto text-slate-500 mb-3" />
            <p class="text-sm text-slate-300 mb-1">
              Drag and drop your file here, or
              <button
                type="button"
                class="text-blue-400 hover:text-blue-300 underline"
                @click="fileInput?.click()"
              >
                browse
              </button>
            </p>
            <p class="text-xs text-slate-500">Supports CSV, XLS, XLSX files</p>
          </div>

          <div v-else class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <FileSpreadsheet :size="24" class="text-green-400" />
              <div>
                <p class="text-sm text-slate-200 font-medium">{{ selectedFile.name }}</p>
                <p class="text-xs text-slate-500">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
              </div>
            </div>
            <button
              type="button"
              class="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 transition-colors"
              :disabled="importing"
              @click="clearFile"
            >
              <X :size="18" />
            </button>
          </div>
        </div>
      </div>

      <!-- Import Results -->
      <div v-if="isComplete" class="space-y-3">
        <!-- Success Summary -->
        <div
          v-if="importResult!.success > 0"
          class="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
        >
          <div class="flex items-start gap-3">
            <CheckCircle2 :size="20" class="text-green-400 shrink-0 mt-0.5" />
            <div>
              <h4 class="text-sm font-medium text-green-300 mb-1">Import Successful</h4>
              <p class="text-xs text-slate-400">
                Successfully imported {{ importResult!.success }} student{{
                  importResult!.success !== 1 ? 's' : ''
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Error Summary -->
        <div
          v-if="hasErrors"
          class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-h-64 overflow-y-auto scrollbar-thin"
        >
          <div class="flex items-start gap-3 mb-3">
            <AlertCircle :size="20" class="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 class="text-sm font-medium text-red-300 mb-1">Import Errors</h4>
              <p class="text-xs text-slate-400">
                Failed to import {{ importResult!.failed }} student{{
                  importResult!.failed !== 1 ? 's' : ''
                }}
              </p>
            </div>
          </div>
          <div class="space-y-2 pl-8">
            <div
              v-for="(error, index) in importResult!.errors"
              :key="index"
              class="text-xs bg-slate-800/50 rounded p-2"
            >
              <span class="text-slate-400">Row {{ error.row }}:</span>
              <span class="text-slate-300 ml-1">{{ error.field }}</span>
              <span class="text-red-400 ml-1">- {{ error.message }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-4 py-2 text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 rounded transition-all"
            @click="reset"
          >
            Import Another File
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-all"
            @click="handleClose"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <template v-if="!isComplete">
        <button
          type="button"
          class="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-all"
          :disabled="importing"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded transition-all"
          :disabled="!selectedFile || importing"
          @click="importStudents"
        >
          {{ importing ? 'Importing...' : 'Import Students' }}
        </button>
      </template>
    </template>
  </Modal>
</template>
