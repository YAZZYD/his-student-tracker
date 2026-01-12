<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useStudentData } from '@renderer/composables/useStudentData'
import { formatDate, getRatingColor } from '@renderer/lib/format.utils'

const router = useRouter()

const props = defineProps<{ code: string }>()

// ============================================================================
// COMPOSABLES
// ============================================================================

const {
  student,
  loading,
  error: studentError,
  fetchStudent,
  softSkills,
  hardSkills
} = useStudentData()

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

type Tab = 'info' | 'activities' | 'skills' | 'ratings'
const activeTab = ref<Tab>('info')

const submitting = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Reference data
const specialtiesWithGrades = ref<
  Array<{ id: number; name: string; grades: Array<{ id: number; name: string }> }>
>([])

// Activities management
const selectedActivityIds = ref<Set<number>>(new Set())

// Rating form
const selectedSkillsForRating = ref<Map<number, number>>(new Map())
const rating comment = ref('')
const showRatingForm = ref(false)

// Change tracking
const hasUnsavedChanges = ref(false)

// ============================================================================
// VALIDATION
// ============================================================================

const studentInfoSchema = toTypedSchema(
  z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    birth_date: z.string().min(1, 'Birth date is required'),
    birth_place: z.string().min(2, 'Birth place is required'),
    enrollment_year: z.string().min(4, 'Enrollment year is required'),
    gradeId: z.number().min(1, 'Grade is required'),
    specialtyId: z.number().min(1, 'Specialty is required')
  })
)

const { defineField, handleSubmit, errors, setValues } = useForm({
  validationSchema: studentInfoSchema
})

const [code, codeAttrs] = defineField('code')
const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [birth_date, birthDateAttrs] = defineField('birth_date')
const [birth_place, birthPlaceAttrs] = defineField('birth_place')
const [enrollment_year, enrollmentYearAttrs] = defineField('enrollment_year')
const [gradeId, gradeIdAttrs] = defineField('gradeId')
const [specialtyId, specialtyIdAttrs] = defineField('specialtyId')

// ============================================================================
// COMPUTED
// ============================================================================

const activityTypeMap: Record<string, { color: string; icon: string; label: string }> = {
  INTERNSHIP: {
    color: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    icon: '💼',
    label: 'Internship'
  },
  EVENT: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: '🎉', label: 'Event' },
  WORKSHOP: {
    color: 'bg-green-500/10 border-green-500/30 text-green-400',
    icon: '🔧',
    label: 'Workshop'
  },
  SPORT: {
    color: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    icon: '⚽',
    label: 'Sport'
  }
}

// Get available grades based on selected specialty
const availableGrades = computed(() => {
  if (!specialtyId.value) return []
  const specialty = specialtiesWithGrades.value.find((s) => s.id === specialtyId.value)
  return specialty?.grades || []
})

// Get all activities from student data
const allActivities = computed(() => student.value?.activities || [])

// Get all skills from ratings
const allSkills = computed(() => {
  if (!student.value?.ratings?.length) return []
  const skillsMap = new Map()
  student.value.ratings.forEach((rating) => {
    rating.skillRatings.forEach((sr) => {
      if (!skillsMap.has(sr.skill.id)) {
        skillsMap.set(sr.skill.id, sr.skill)
      }
    })
  })
  return Array.from(skillsMap.values())
})

const softSkills = computed(() => allSkills.value.filter((s: any) => s.type === 'SOFT'))
const hardSkills = computed(() => allSkills.value.filter((s: any) => s.type === 'HARD'))

const selectedActivities = computed(() =>
  allActivities.value.filter((a) => selectedActivityIds.value.has(a.id))
)

const canSubmitRating = computed(
  () =>
    selectedSkillsForRating.value.size > 0 &&
    Array.from(selectedSkillsForRating.value.values()).every((score) => score >= 0 && score <= 100)
)

const tabCounts = computed(() => ({
  activities: selectedActivityIds.value.size,
  ratings: student.value?.ratings?.length || 0
}))

// ============================================================================
// DATA FETCHING
// ============================================================================

const fetchData = async () => {
  error.value = null

  try {
    // Fetch student data and specialties with grades in parallel
    const [_, specialtiesRes] = await Promise.all([
      fetchStudent(props.code),
      window.api.indexAcademicCatalog()
    ])

    if (studentError.value) {
      error.value = studentError.value
      return
    }

    if (!student.value) throw new Error('Student not found')

    if (!specialtiesRes.success)
      throw new Error(specialtiesRes.message || 'Failed to load specialties')

    specialtiesWithGrades.value = specialtiesRes.data || []

    // Populate form with existing data
    setValues({
      code: student.value.code,
      name: student.value.name,
      email: student.value.email,
      birth_date: new Date(student.value.birth_date).toISOString().split('T')[0],
      birth_place: student.value.birth_place,
      enrollment_year: new Date(student.value.enrollment_year).toISOString().split('T')[0],
      gradeId: student.value.gradeId,
      specialtyId: student.value.specialtyId
    })

    // Initialize selected activities
    selectedActivityIds.value = new Set(student.value.activities?.map((a) => a.id) || [])

    hasUnsavedChanges.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to load data'
  }
}

// ============================================================================
// FORM SUBMISSIONS
// ============================================================================

const saveStudentInfo = handleSubmit(async (values) => {
  submitting.value = true
  error.value = null
  successMessage.value = null

  // try {
  //   const payload = {
  //     ...values,
  //     birth_date: new Date(values.birth_date).toISOString(),
  //     enrollment_year: new Date(values.enrollment_year).toISOString(),
  //     gradeId: Number(values.gradeId),
  //     specialtyId: Number(values.specialtyId)
  //   }

  //   const result = await window.api.invoke('update-student-info', {
  //     code: route.params.code,
  //     data: payload
  //   })

  //   if (!result.success) throw new Error(result.message || 'Update failed')

  //   // Refresh student data
  //   await fetchStudent(route.params.code as string)

  //   successMessage.value = 'Student information updated successfully'
  //   hasUnsavedChanges.value = false
  //   setTimeout(() => (successMessage.value = null), 3000)
  // } catch (err: any) {
  //   error.value = err.message || 'Failed to update student information'
  // } finally {
  //   submitting.value = false
  // }
})

const saveActivities = async () => {
  submitting.value = true
  error.value = null
  successMessage.value = null

  // try {
  //   const result = await window.api.invoke('update-student-activities', {
  //     code: route.params.code,
  //     activityIds: Array.from(selectedActivityIds.value)
  //   })

  //   if (!result.success) throw new Error(result.message || 'Update failed')

  //   // Refresh student data
  //   await fetchStudent(route.params.code as string)

  //   successMessage.value = 'Activities updated successfully'
  //   hasUnsavedChanges.value = false
  //   setTimeout(() => (successMessage.value = null), 3000)
  // } catch (err: any) {
  //   error.value = err.message || 'Failed to update activities'
  // } finally {
  //   submitting.value = false
  // }
}

const submitRating = async () => {
  if (!canSubmitRating.value) return

  submitting.value = true
  error.value = null
  successMessage.value = null

  // try {
  //   const skillRatings = Array.from(selectedSkillsForRating.value.entries()).map(
  //     ([skillId, score]) => ({ skillId, score })
  //   )

  //   const result = await window.api.invoke('create-rating', {
  //     studentCode: route.params.code,
  //      comment: rating comment.value.trim() || null,
  //     skillRatings
  //   })

  //   if (!result.success) throw new Error(result.message || 'Failed to submit rating')

  //   // Refresh student data
  //   await fetchStudent(route.params.code as string)

  //   // Reset form
  //   selectedSkillsForRating.value.clear()
  //   rating comment.value = ''
  //   showRatingForm.value = false

  //   successMessage.value = 'Rating submitted successfully'
  //   setTimeout(() => (successMessage.value = null), 3000)
  // } catch (err: any) {
  //   error.value = err.message || 'Failed to submit rating'
  // } finally {
  //   submitting.value = false
  // }
}

const deleteRating = async (ratingId: number) => {
  if (!confirm('Are you sure you want to delete this rating?')) return

  // try {
  //   const result = await window.api.invoke('delete-rating', ratingId)
  //   if (!result.success) throw new Error(result.message || 'Delete failed')

  //   await fetchStudent(route.params.code as string)
  //   successMessage.value = 'Rating deleted successfully'
  //   setTimeout(() => (successMessage.value = null), 3000)
  // } catch (err: any) {
  //   error.value = err.message || 'Failed to delete rating'
  // }
}

// ============================================================================
// UI INTERACTIONS
// ============================================================================

const toggleActivity = (activityId: number) => {
  if (selectedActivityIds.value.has(activityId)) {
    selectedActivityIds.value.delete(activityId)
  } else {
    selectedActivityIds.value.add(activityId)
  }
  hasUnsavedChanges.value = true
}

const toggleSkillForRating = (skillId: number) => {
  if (selectedSkillsForRating.value.has(skillId)) {
    selectedSkillsForRating.value.delete(skillId)
  } else {
    selectedSkillsForRating.value.set(skillId, 75)
  }
}

const updateSkillScore = (skillId: number, score: number) => {
  const clampedScore = Math.max(0, Math.min(100, score))
  selectedSkillsForRating.value.set(skillId, clampedScore)
}

const switchTab = (tab: Tab) => {
  if (hasUnsavedChanges.value && activeTab.value === 'info') {
    if (!confirm('You have unsaved changes. Discard them?')) return
  }
  activeTab.value = tab
  error.value = null
  successMessage.value = null
}

// Watch specialty change to reset grade if not available
watch(specialtyId, (newSpecialtyId) => {
  if (newSpecialtyId && gradeId.value) {
    const specialty = specialtiesWithGrades.value.find((s) => s.id === newSpecialtyId)
    const gradeExists = specialty?.grades.some((g) => g.id === gradeId.value)
    if (!gradeExists) {
      gradeId.value = specialty?.grades[0]?.id || 0
    }
  }
})

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  fetchData()
})

// Track form changes
watch([code, name, email, birth_date, birth_place, enrollment_year, gradeId, specialtyId], () => {
  if (student.value) hasUnsavedChanges.value = true
})

// Prevent navigation with unsaved changes
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div class="w-full max-w-6xl mx-auto p-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="space-y-3 text-center">
        <div
          class="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"
        ></div>
        <p class="text-slate-400 text-sm">Loading student data...</p>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="student">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="router.push(`/students/${student.code}`)"
            class="text-slate-400 hover:text-slate-300 transition-colors text-sm"
            type="button"
          >
            ← Back to Profile
          </button>
          <div class="h-4 w-px bg-slate-700"></div>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white"
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

      <!-- Global Messages -->
      <div v-if="error" class="bg-red-950/20 border border-red-500/30 rounded-lg p-4 mb-6">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>

      <div
        v-if="successMessage"
        class="bg-green-950/20 border border-green-500/30 rounded-lg p-4 mb-6"
      >
        <p class="text-green-400 text-sm">{{ successMessage }}</p>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg mb-6 overflow-hidden">
        <div class="flex border-b border-slate-700/50">
          <button
            @click="switchTab('info')"
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
            :class="
              activeTab === 'info'
                ? 'text-blue-400 bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            "
          >
            <span>Basic Information</span>
            <div
              v-if="activeTab === 'info'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            ></div>
          </button>

          <button
            @click="switchTab('activities')"
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
            :class="
              activeTab === 'activities'
                ? 'text-blue-400 bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            "
          >
            <span>Activities</span>
            <span
              v-if="tabCounts.activities > 0"
              class="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400"
            >
              {{ tabCounts.activities }}
            </span>
            <div
              v-if="activeTab === 'activities'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            ></div>
          </button>

          <button
            @click="switchTab('skills')"
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
            :class="
              activeTab === 'skills'
                ? 'text-blue-400 bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            "
          >
            <span>Skills Overview</span>
            <div
              v-if="activeTab === 'skills'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            ></div>
          </button>

          <button
            @click="switchTab('ratings')"
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
            :class="
              activeTab === 'ratings'
                ? 'text-blue-400 bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            "
          >
            <span>Ratings</span>
            <span
              v-if="tabCounts.ratings > 0"
              class="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400"
            >
              {{ tabCounts.ratings }}
            </span>
            <div
              v-if="activeTab === 'ratings'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            ></div>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="space-y-6">
        <!-- BASIC INFORMATION TAB
        <template v-if="activeTab === 'info'">
          <form @submit="saveStudentInfo" class="space-y-6">
            <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 space-y-5">
              <h2 class="text-sm font-semibold text-slate-300 mb-4">Contact Information</h2>

              <div class="grid md:grid-cols-2 gap-5">
                <div>
                  <label for="code" class="block text-xs font-medium text-slate-400 mb-2">
                    Student Code *
                  </label>
                  <input
                    id="code"
                    v-bind="codeAttrs"
                    type="text"
                    class="w-full bg-slate-900/50 border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    :class="errors.code ? 'border-red-500/50' : 'border-slate-700/50'"
                  />
                  <p v-if="errors.code" class="text-xs text-red-400 mt-1">{{ errors.code }}</p>
                </div>

                <div>
                  <label for="name" class="block text-xs font-medium text-slate-400 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    v-model="name"
                    v-bind="nameAttrs"
                    type="text"
                    class="w-full bg-slate-900/50 border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    :class="errors.name ? 'border-red-500/50' : 'border-slate-700/50'"
                  />
                  <p v-if="errors.name" class="text-xs text-red-400 mt-1">{{ errors.name }}</p>
                </div>
              </div>

              <div>
                <label for="email" class="block text-xs font-medium text-slate-400 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  v-model="email"
                  v-bind="emailAttrs"
                  type="email"
                  class="w-full bg-slate-900/50 border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  :class="errors.email ? 'border-red-500/50' : 'border-slate-700/50'"
                />
                <p v-if="errors.email" class="text-xs text-red-400 mt-1">{{ errors.email }}</p>
              </div>
            </div>

            <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 space-y-5">
              <h2 class="text-sm font-semibold text-slate-300 mb-4">Personal Details</h2>

              <div class="grid md:grid-cols-2 gap-5">
                <div>
                  <label for="birth_date" class="block text-xs font-medium text-slate-400 mb-2">
                    Birth Date *
                  </label>
                  <input
                    id="birth_date"
                    v-model="birth_date"
                    v-bind="birthDateAttrs"
                    type="date"
                    class="w-full bg-slate-900/50 border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    :class="errors.birth_date ? 'border-red-500/50' : 'border-slate-700/50'"
                  />
                  <p v-if="errors.birth_date" class="text-xs text-red-400 mt-1">
                    {{ errors.birth_date }}
                  </p>
                </div>

                <div>
                  <label for="birth_place" class="block text-xs font-medium text-slate-400 mb-2">
                    Birth Place *
                  </label>
                  <input
                    id="birth_place"
                    v-model="birth_place"
                    v-bind="birthPlaceAttrs"
                    type="text"
                    class="w-full bg-slate-900/50 border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    :class="errors.birth_place ? 'border-red-500/50' : 'border-slate-700/50'"
                  />
                  <p v-if="errors.birth_place" class="text-xs text-red-400 mt-1">
                    {{ errors.birth_place }}
                  </p>
                </div>
              </div>

              <div>
                <label for="enrollment_year" class="block text-xs font-medium text-slate-400 mb-2">
                  Enrollment Date *
                </label>
                <input
                  id="enrollment_year"
                  v-model="enrollment_year"
                  v-bind="enrollmentYearAttrs"
                  type="date"
                  class="w-full bg-slate-900/50 border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  :class="errors.enrollment_year ? 'border-red-500/50' : 'border-slate-700/50'"
                />
                <p v-if="errors.enrollment_year" class="text-xs text-red-400 mt-1">
                  {{ errors.enrollment_year }}
                </p>
              </div>
            </div>

            <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 space-y-5">
              <h2 class="text-sm font-semibold text-slate-300 mb-4">Academic Information</h2>

              <div class="grid md:grid-cols-2 gap-5">
                <div>
                  <label for="specialtyId" class="block text-xs font-medium text-slate-400 mb-2">
                    Specialty *
                  </label>
                  <select
                    id="specialtyId"
                    v-model.number="specialtyId"
                    v-bind="specialtyIdAttrs"
                    class="w-full bg-slate-900/50 border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    :class="errors.specialtyId ? 'border-red-500/50' : 'border-slate-700/50'"
                  >
                    <option value="" disabled>Select specialty</option>
                    <option
                      v-for="specialty in specialtiesWithGrades"
                      :key="specialty.id"
                      :value="specialty.id"
                    >
                      {{ specialty.name }}
                    </option>
                  </select>
                  <p v-if="errors.specialtyId" class="text-xs text-red-400 mt-1">
                    {{ errors.specialtyId }}
                  </p>
                </div>

                <div>
                  <label for="gradeId" class="block text-xs font-medium text-slate-400 mb-2">
                    Grade *
                  </label>
                  <select
                    id="gradeId"
                    v-model.number="gradeId"
                    v-bind="gradeIdAttrs"
                    class="w-full bg-slate-900/50 border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    :class="errors.gradeId ? 'border-red-500/50' : 'border-slate-700/50'"
                    :disabled="!specialtyId || !availableGrades.length"
                  >
                    <option value="" disabled>
                      {{ !specialtyId ? 'Select specialty first' : 'Select grade' }}
                    </option>
                    <option v-for="grade in availableGrades" :key="grade.id" :value="grade.id">
                      {{ grade.name }}
                    </option>
                  </select>
                  <p v-if="errors.gradeId" class="text-xs text-red-400 mt-1">
                    {{ errors.gradeId }}
                  </p>
                  <p
                    v-if="specialtyId && !availableGrades.length"
                    class="text-xs text-amber-400 mt-1"
                  >
                    No grades available for this specialty
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                type="button"
                @click="router.push(`/students/${student.code}`)"
                class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                :disabled="submitting"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
                :disabled="submitting || !hasUnsavedChanges"
              >
                {{ submitting ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </template> -->

        <!-- ACTIVITIES TAB -->
        <!-- <template v-if="activeTab === 'activities'">
          <div class="space-y-6">
            <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-sm font-semibold text-slate-300">
                  Select Activities ({{ selectedActivityIds.size }} selected)
                </h2>
                <button
                  @click="(selectedActivityIds.clear(), (hasUnsavedChanges = true))"
                  class="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  type="button"
                >
                  Clear all
                </button>
              </div>

              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  v-for="activity in allActivities"
                  :key="activity.id"
                  @click="toggleActivity(activity.id)"
                  type="button"
                  class="text-left border rounded p-4 transition-all hover:scale-[1.02]"
                  :class="[
                    activityTypeMap[activity.type].color,
                    selectedActivityIds.has(activity.id)
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900'
                      : 'hover:border-slate-600'
                  ]"
                >
                  <div class="flex items-start justify-between mb-2">
                    <span class="text-[10px] font-medium uppercase tracking-wide">
                      {{ activityTypeMap[activity.type].label }}
                    </span>
                    <div class="flex items-center gap-2">
                      <span class="text-base">{{ activityTypeMap[activity.type].icon }}</span>
                      <div
                        v-if="selectedActivityIds.has(activity.id)"
                        class="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"
                      >
                        <svg
                          class="w-2.5 h-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h4 class="text-sm font-medium text-white mb-1 line-clamp-1">
                    {{ activity.name }}
                  </h4>
                  <p class="text-xs text-slate-400 line-clamp-2">{{ activity.description }}</p>
                </button>
              </div>
              <p v-if="!allActivities.length" class="text-slate-500 text-sm text-center py-8">
                No activities available
              </p>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                type="button"
                @click="router.push(`/students/${student.code}`)"
                class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                :disabled="submitting"
              >
                Cancel
              </button>
              <button
                @click="saveActivities"
                type="button"
                class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
                :disabled="submitting || !hasUnsavedChanges"
              >
                {{ submitting ? 'Saving...' : 'Save Activities' }}
              </button>
            </div>
          </div>
        </template> -->

        <!-- SKILLS OVERVIEW TAB -->
        <!-- <template v-if="activeTab === 'skills'">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-lg">🧠</span>
                <h3 class="text-sm font-semibold text-purple-400">
                  Soft Skills ({{ softSkills.length }})
                </h3>
              </div>

              <div v-if="softSkills.length" class="space-y-3">
                <div
                  v-for="skill in softSkills"
                  :key="skill.id"
                  class="border border-slate-700/30 rounded p-3 hover:border-purple-500/30 transition-colors"
                >
                  <h4 class="text-sm font-medium text-white mb-1">{{ skill.name }}</h4>
                  <p class="text-xs text-slate-400">{{ skill.description }}</p>
                </div>
              </div>
              <p v-else class="text-slate-500 text-xs text-center py-8">No soft skills rated yet</p>
            </div>

            <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-lg">⚙️</span>
                <h3 class="text-sm font-semibold text-cyan-400">
                  Hard Skills ({{ hardSkills.length }})
                </h3>
              </div>

              <div v-if="hardSkills.length" class="space-y-3">
                <div
                  v-for="skill in hardSkills"
                  :key="skill.id"
                  class="border border-slate-700/30 rounded p-3 hover:border-cyan-500/30 transition-colors"
                >
                  <h4 class="text-sm font-medium text-white mb-1">{{ skill.name }}</h4>
                  <p class="text-xs text-slate-400">{{ skill.description }}</p>
                </div>
              </div>
              <p v-else class="text-slate-500 text-xs text-center py-8">No hard skills rated yet</p>
            </div>
          </div>

          <div class="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
            <p class="text-blue-400 text-xs">
              💡 Skills shown here are those that have been rated. Switch to the Ratings tab to add
              new evaluations.
            </p>
          </div>
        </template> -->

        <!-- RATINGS TAB -->
        <template v-if="activeTab === 'ratings'">
          <div class="space-y-6">
            <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                @click="showRatingForm = !showRatingForm"
                type="button"
                class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span class="text-blue-400 text-sm">+</span>
                  </div>
                  <span class="text-sm font-medium text-slate-300">Add New Rating</span>
                </div>
                <svg
                  class="w-4 h-4 text-slate-400 transition-transform"
                  :class="{ 'rotate-180': showRatingForm }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div v-if="showRatingForm" class="px-6 pb-6 space-y-5 border-t border-slate-700/50">
                <div class="pt-5">
                  <h3 class="text-sm font-medium text-slate-300 mb-3">
                    Select Skills & Assign Scores ({{ selectedSkillsForRating.size }} selected)
                  </h3>

                  <div class="space-y-4">
                    <div v-if="softSkills.length">
                      <p class="text-xs text-purple-400 mb-2 flex items-center gap-1">
                        <span>🧠</span>
                        <span>Soft Skills</span>
                      </p>
                      <div class="space-y-2">
                        <div
                          v-for="skill in softSkills"
                          :key="skill.id"
                          class="border rounded p-3 transition-all"
                          :class="
                            selectedSkillsForRating.has(skill.id)
                              ? 'border-purple-500/50 bg-purple-500/5'
                              : 'border-slate-700/30 hover:border-slate-600/50'
                          "
                        >
                          <div class="flex items-center gap-3">
                            <button
                              @click="toggleSkillForRating(skill.id)"
                              type="button"
                              class="flex-shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center"
                              :class="
                                selectedSkillsForRating.has(skill.id)
                                  ? 'border-purple-500 bg-purple-500'
                                  : 'border-slate-600 hover:border-slate-500'
                              "
                            >
                              <svg
                                v-if="selectedSkillsForRating.has(skill.id)"
                                class="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="3"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>

                            <div class="flex-1 min-w-0">
                              <p class="text-xs font-medium text-slate-300">{{ skill.name }}</p>
                            </div>

                            <div
                              v-if="selectedSkillsForRating.has(skill.id)"
                              class="flex items-center gap-2 flex-shrink-0"
                            >
                              <input
                                type="number"
                                min="0"
                                max="100"
                                :value="selectedSkillsForRating.get(skill.id)"
                                @input="
                                  updateSkillScore(
                                    skill.id,
                                    parseInt(($event.target as HTMLInputElement).value) || 0
                                  )
                                "
                                class="w-16 bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <input
                                type="range"
                                min="0"
                                max="100"
                                :value="selectedSkillsForRating.get(skill.id)"
                                @input="
                                  updateSkillScore(
                                    skill.id,
                                    parseInt(($event.target as HTMLInputElement).value)
                                  )
                                "
                                class="w-24"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="hardSkills.length">
                      <p class="text-xs text-cyan-400 mb-2 flex items-center gap-1">
                        <span>⚙️</span>
                        <span>Hard Skills</span>
                      </p>
                      <div class="space-y-2">
                        <div
                          v-for="skill in hardSkills"
                          :key="skill.id"
                          class="border rounded p-3 transition-all"
                          :class="
                            selectedSkillsForRating.has(skill.id)
                              ? 'border-cyan-500/50 bg-cyan-500/5'
                              : 'border-slate-700/30 hover:border-slate-600/50'
                          "
                        >
                          <div class="flex items-center gap-3">
                            <button
                              @click="toggleSkillForRating(skill.id)"
                              type="button"
                              class="flex-shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center"
                              :class="
                                selectedSkillsForRating.has(skill.id)
                                  ? 'border-cyan-500 bg-cyan-500'
                                  : 'border-slate-600 hover:border-slate-500'
                              "
                            >
                              <svg
                                v-if="selectedSkillsForRating.has(skill.id)"
                                class="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="3"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>

                            <div class="flex-1 min-w-0">
                              <p class="text-xs font-medium text-slate-300">{{ skill.name }}</p>
                            </div>

                            <div
                              v-if="selectedSkillsForRating.has(skill.id)"
                              class="flex items-center gap-2 flex-shrink-0"
                            >
                              <input
                                type="number"
                                min="0"
                                max="100"
                                :value="selectedSkillsForRating.get(skill.id)"
                                @input="
                                  updateSkillScore(
                                    skill.id,
                                    parseInt(($event.target as HTMLInputElement).value) || 0
                                  )
                                "
                                class="w-16 bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              />
                              <input
                                type="range"
                                min="0"
                                max="100"
                                :value="selectedSkillsForRating.get(skill.id)"
                                @input="
                                  updateSkillScore(
                                    skill.id,
                                    parseInt(($event.target as HTMLInputElement).value)
                                  )
                                "
                                class="w-24"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p v-if="!allSkills.length" class="text-slate-500 text-xs text-center py-4">
                      No skills available for rating
                    </p>
                  </div>
                </div>

                <div>
                  <label for=" comment" class="block text-xs font-medium text-slate-400 mb-2">
                    comment (Optional)
                  </label>
                  <textarea
                    id=" comment"
                    v-model="rating comment"
                    rows="3"
                    placeholder="Add any additional notes or feedback..."
                    class="w-full bg-slate-900/50 border border-slate-700/50 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  ></textarea>
                </div>

                <div class="flex items-center justify-end gap-3 pt-2">
                  <button
                    @click="showRatingForm = false"
                    type="button"
                    class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                    :disabled="submitting"
                  >
                    Cancel
                  </button>
                  <button
                    @click="submitRating"
                    type="button"
                    class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
                    :disabled="!canSubmitRating || submitting"
                  >
                    {{ submitting ? 'Submitting...' : 'Submit Rating' }}
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="student.ratings && student.ratings.length"
              class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
            >
              <h3 class="text-sm font-semibold text-slate-300 mb-4">
                Rating History ({{ student.ratings.length }})
              </h3>

              <div class="space-y-3">
                <div
                  v-for="rating in student.ratings"
                  :key="rating.id"
                  class="border border-slate-700/30 rounded p-4 hover:border-slate-600/50 transition-colors"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <p class="text-xs text-slate-400 mb-1">{{ formatDate(rating.createdAt) }}</p>
                      <div class="flex items-center gap-2">
                        <span
                          class="text-lg font-bold"
                          :style="{
                            color: getRatingColor(
                              Math.round(
                                rating.skillRatings.reduce(
                                  (sum: number, sr: any) => sum + sr.score,
                                  0
                                ) / rating.skillRatings.length
                              )
                            )
                          }"
                        >
                          {{
                            Math.round(
                              rating.skillRatings.reduce(
                                (sum: number, sr: any) => sum + sr.score,
                                0
                              ) / rating.skillRatings.length
                            )
                          }}
                        </span>
                        <span class="text-xs text-slate-500">average</span>
                      </div>
                    </div>
                    <button
                      @click="deleteRating(rating.id)"
                      type="button"
                      class="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  <p v-if="rating.comment" class="text-xs text-slate-300 mb-3 italic">
                    "{{ rating.comment }}"
                  </p>

                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="sr in rating.skillRatings"
                      :key="sr.skill.id"
                      class="px-2 py-1 text-xs font-medium rounded border"
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

            <div
              v-else
              class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-12 text-center"
            >
              <p class="text-slate-500 text-sm mb-2">No ratings yet</p>
              <p class="text-slate-600 text-xs">
                Click "Add New Rating" above to create the first rating
              </p>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
