<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import Modal from '@renderer/components/ui/modal/Modal.vue'
import { activityTypeMap } from '@renderer/constants/activity.constants'
import type { Activity } from '@renderer/types/models'
import type { ResponseSchema as Response } from '@/schemas/response.schema'
import {
  activityType as activityTyped,
  createActivitySchema,
  updateActivitySchema
} from '@/schemas/activity.schema'

interface Props {
  show: boolean
  activity?: Activity | null
  mode?: 'create' | 'update'
}

const props = withDefaults(defineProps<Props>(), {
  activity: null,
  mode: 'create'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
  (e: 'updated'): void
}>()

const submitting = ref(false)

const isUpdateMode = computed(() => props.mode === 'update' && props.activity !== null)
const modalTitle = computed(() => (isUpdateMode.value ? 'Update Activity' : 'Create New Activity'))
const submitButtonText = computed(() =>
  submitting.value
    ? isUpdateMode.value
      ? 'Updating...'
      : 'Creating...'
    : isUpdateMode.value
      ? 'Update Activity'
      : 'Create Activity'
)

const validationSchema = computed(() =>
  isUpdateMode.value ? updateActivitySchema : createActivitySchema
)

const { defineField, handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(validationSchema.value)
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [type, typeAttrs] = defineField('type')

watch(
  () => props.activity,
  (activity) => {
    if (activity && props.mode === 'update') {
      setValues({
        name: activity.name,
        description: activity.description,
        type: activity.type
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

watch(
  () => props.show,
  (show) => {
    if (!show) {
      resetForm()
    } else if (!isUpdateMode.value) {
      resetForm()
    }
  }
)

const submitActivity = handleSubmit(async (values) => {
  submitting.value = true
  try {
    let res: Response

    if (isUpdateMode.value) {
      const payload = {
        id: props.activity!.id,
        name: values.name,
        description: values.description,
        type: values.type
      }
      res = await window.api.activity.update(payload)
      if (res.success) {
        emit('updated')
        emit('close')
        resetForm()
      }
    } else {
      const payload = {
        name: values.name,
        description: values.description,
        type: values.type
      }
      res = await window.api.activity.create(payload)
      if (res.success) {
        emit('created')
        emit('close')
        resetForm()
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    submitting.value = false
  }
})

const handleClose = (): void => {
  if (!submitting.value) {
    emit('close')
    resetForm()
  }
}
</script>

<template>
  <Modal :show="show" :title="modalTitle" width="550px" @close="handleClose">
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-slate-400 mb-2">Activity Name</label>
        <input
          v-model="name"
          v-bind="nameAttrs"
          type="text"
          placeholder="e.g., Leadership Workshop, Basketball Tournament"
          class="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          :class="errors.name ? 'border-red-500' : 'border-slate-700'"
          :disabled="submitting"
        />
        <p v-if="errors.name" class="text-xs text-red-400 mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-400 mb-2">Description</label>
        <textarea
          v-model="description"
          v-bind="descriptionAttrs"
          placeholder="Describe the activity..."
          rows="4"
          class="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          :class="errors.description ? 'border-red-500' : 'border-slate-700'"
          :disabled="submitting"
        />
        <p v-if="errors.description" class="text-xs text-red-400 mt-1">
          {{ errors.description }}
        </p>
      </div>

      <div>
        <!-- eslint-disable-next-line -->
        <input type="hidden" v-model="type" v-bind="typeAttrs" />
        <label class="block text-xs font-medium text-slate-400 mb-2">Activity Type</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="(config, activityType) in activityTypeMap"
            :key="activityType"
            type="button"
            class="px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium flex flex-col items-center gap-1"
            :class="
              type === activityType
                ? `${config.color} border-2`
                : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
            "
            :disabled="submitting"
            @click="type = activityType as activityTyped"
          >
            <span class="text-xl">{{ config.icon }}</span>
            <span>{{ activityType }}</span>
          </button>
        </div>
        <p v-if="errors.type" class="text-xs text-red-400 mt-1">{{ errors.type }}</p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-all"
        :disabled="submitting"
        @click="handleClose"
      >
        Cancel
      </button>
      <button
        type="button"
        class="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded transition-all"
        :disabled="submitting"
        @click="submitActivity"
      >
        {{ submitButtonText }}
      </button>
    </template>
  </Modal>
</template>
