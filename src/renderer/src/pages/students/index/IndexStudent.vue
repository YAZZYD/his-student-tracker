<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import StudentRow from './components/index/StudentRow.vue'
import type { ResponseSchema as Response } from '@/schemas/response.schema'
import type { StudentHeadInfo, StudentCode } from '@renderer/types/models'
import { router } from '@renderer/router'
import { UserPlus, Search, X } from 'lucide-vue-next'

interface Meta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
}

const students = ref<StudentHeadInfo[]>([])
const meta = ref<Meta | null>(null)
const loading = ref(false)
const page = ref(1)
const searchQuery = ref('')

const fetchStudents = async (page = 1, query = ''): Promise<void> => {
  loading.value = true
  try {
    const res: Response = await window.api.indexStudent(page, query)
    if (res.success) {
      students.value = res.data.students
      meta.value = res.data.meta
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn((query: string) => {
  page.value = 1
  fetchStudents(1, query)
}, 300)

const handleSearch = (): void => {
  debouncedSearch(searchQuery.value)
}

const clearSearch = (): void => {
  searchQuery.value = ''
  page.value = 1
  fetchStudents(1, '')
}

const showStudent = async (student: StudentCode): Promise<void> => {
  router.replace({ name: 'student-show', params: { code: student.code } })
}

const editStudent = async (student: StudentCode): Promise<void> => {
  router.replace({ name: 'student-edit', params: { code: student.code } })
}

const deleteStudent = async (student: StudentCode): Promise<void> => console.log('Delete', student)

const prevPage = (): void => {
  if (page.value > 1) {
    page.value--
    fetchStudents(page.value, searchQuery.value)
  }
}

const nextPage = (): void => {
  if (meta.value && page.value < meta.value.lastPage) {
    page.value++
    fetchStudents(page.value, searchQuery.value)
  }
}

const navigateToCreate = (): void => {
  router.push({ name: 'student-create' })
}

onMounted(() => fetchStudents())
</script>

<template>
  <div class="p-6 w-full max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Students</h1>
          <p v-if="meta" class="text-sm text-slate-400 mt-1.5">
            <span class="font-medium text-slate-300">{{ meta.total }}</span>
            {{ searchQuery ? 'matching' : 'total' }} students
          </p>
        </div>

        <!-- Search Bar -->
        <div class="relative flex-1 max-w-md">
          <Search
            :size="18"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search students..."
            class="w-full pl-10 pr-9 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            @input="handleSearch"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear"
            @click="clearSearch"
          >
            <X :size="16" :stroke-width="2" />
          </button>
        </div>

        <button
          class="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg border border-blue-500/50 hover:border-blue-600/50 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-600/40"
          @click="navigateToCreate"
        >
          <UserPlus :size="18" :stroke-width="2" />
          <span>Create Student</span>
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden"
    >
      <!-- Loading Overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-slate-300 font-medium">Loading...</span>
        </div>
      </div>

      <!-- Table Header (Fixed) -->
      <div class="bg-slate-900/80 border-b border-slate-700/50">
        <table class="w-full">
          <thead>
            <tr class="text-slate-300 text-sm font-semibold">
              <th class="px-6 py-4 text-center w-32">Code</th>
              <th class="px-6 py-4 text-center">Name</th>
              <th class="px-6 py-4 text-center">Email</th>
              <th class="px-6 py-4 text-center">Specialty</th>
              <th class="px-6 py-4 text-center w-32">Grade</th>
              <th class="px-6 py-4 text-right w-36"></th>
            </tr>
          </thead>
        </table>
      </div>

      <!-- Scrollable Body -->
      <div
        class="max-h-[calc(100vh-380px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        <table class="w-full">
          <tbody>
            <StudentRow
              v-for="student in students"
              :key="student.code"
              :student="student"
              @show="showStudent"
              @edit="editStudent"
              @delete="deleteStudent"
            />
            <!-- Empty State -->
            <tr v-if="!loading && students.length === 0">
              <td colspan="7" class="px-6 py-16 text-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <span class="text-lg">
                    {{ searchQuery ? 'No students match your search' : 'No students found' }}
                  </span>
                  <button
                    v-if="searchQuery"
                    class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    @click="clearSearch"
                  >
                    Clear search
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex items-center justify-between">
      <button
        class="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-200 font-medium hover:bg-slate-700 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all"
        :disabled="page === 1 || loading"
        @click="prevPage"
      >
        Previous
      </button>

      <div class="flex items-center gap-2 text-slate-300">
        <span class="text-sm font-medium">Page</span>
        <span class="px-3 py-1 bg-slate-700/50 rounded-lg font-bold">{{ page }}</span>
        <span class="text-sm font-medium">of {{ meta?.lastPage ?? 1 }}</span>
      </div>

      <button
        class="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-200 font-medium hover:bg-slate-700 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50 transition-all"
        :disabled="page === meta?.lastPage || loading"
        @click="nextPage"
      >
        Next
      </button>
    </div>
  </div>
</template>
