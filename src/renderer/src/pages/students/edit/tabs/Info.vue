<script setup lang="ts">
import { useForm } from 'vee-validate'

import { toTypedSchema } from '@vee-validate/zod'
import { watch, ref, computed, onMounted, nextTick } from 'vue'
import { updateStudentInfoSchema } from '@/schemas/student.schema'
import { Student } from '@renderer/types/models'
import { useToast } from '@renderer/composables/useToast'
import { useRouter } from 'vue-router'

//eslint-disable-next-line
const props = defineProps<{
  student: Student
  hasUnsavedChanges: boolean
}>()
const emit = defineEmits<{
  (e: 'dirty'): void
  (e: 'saved'): void
}>()
const router = useRouter()
const toast = useToast()

const submitting = ref(false)
const error = ref(false)
const { defineField, handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema: toTypedSchema(updateStudentInfoSchema)
})
const [code, codeAttrs] = defineField('code')
const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [birth_date, birthDateAttrs] = defineField('birth_date')
const [birth_place, birthPlaceAttrs] = defineField('birth_place')
const [enrollment_year, enrollmentYearAttrs] = defineField('enrollment_year')
const [gradeId, gradeIdAttrs] = defineField('gradeId')
const [specialtyId, specialtyIdAttrs] = defineField('specialtyId')
const specialtiesWithGrades = ref<
  Array<{ id: number; name: string; grades: Array<{ id: number; name: string }> }>
>([])

const availableGrades = computed(() => {
  if (!specialtyId.value) return []
  const specialty = specialtiesWithGrades.value.find((s) => s.id === specialtyId.value)
  return specialty?.grades || []
})

const isInitialized = ref(false)

watch(
  () => meta.value.dirty,
  (dirty) => {
    if (!isInitialized.value) return
    if (dirty) emit('dirty')
  },
  { flush: 'post' }
)

const updateStudentInfo = handleSubmit(async (values) => {
  submitting.value = true
  error.value = false
  try {
    const payload = {
      ...values,
      birth_date: new Date(values.birth_date).toISOString(),
      enrollment_year: new Date(values.enrollment_year).toISOString(),
      gradeId: Number(values.gradeId),
      specialtyId: Number(values.specialtyId)
    }
    const res = await window.api.updateStudent(payload)
    if (res.success) {
      resetForm({ values: { ...values } })
      emit('saved')
      submitting.value = false
      toast.showToast('Student information updated successfully.', 'success')
    }
  } catch (err: any) {
    console.error(err)
    submitting.value = false
    error.value = true
    toast.showToast(err.message || 'An error occurred while updating student info.', 'error')
  }
})

onMounted(async () => {
  try {
    resetForm({
      values: {
        code: props.student.code,
        name: props.student.name,
        email: props.student.email,
        birth_date: new Date(props.student.birth_date).toISOString().split('T')[0],
        birth_place: props.student.birth_place,
        enrollment_year: new Date(props.student.enrollment_year).toISOString().split('T')[0],
        gradeId: props.student.gradeId,
        specialtyId: props.student.specialtyId
      }
    })

    await nextTick()

    const res = await window.api.indexAcademicCatalog()
    specialtiesWithGrades.value = res.data
    isInitialized.value = true
  } catch (err: any) {
    toast.showToast(err.message || 'An error occurred while loading student info.', 'error')
  }
})
</script>

<!-- BASIC INFORMATION TAB -->
<template v-if="activeTab === 'info'">
  <form class="space-y-6" @submit="updateStudentInfo">
    <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 space-y-5">
      <h2 class="text-sm font-semibold text-slate-300 mb-4">Contact Information</h2>

      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <label for="code" class="block text-xs font-medium text-slate-400 mb-2">
            Student Code *
          </label>
          <input
            id="code"
            v-model="code"
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
          <p v-if="specialtyId && !availableGrades.length" class="text-xs text-amber-400 mt-1">
            No grades available for this specialty
          </p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        class="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
        :disabled="submitting"
        @click="router.replace({ name: 'student-show', params: { code: student.code } })"
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
</template>
