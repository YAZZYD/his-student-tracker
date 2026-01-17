<script setup lang="ts">
import { MapPin, Mail, Phone, Calendar, GraduationCap, Briefcase } from 'lucide-vue-next'
import type { StudentWithRelations } from '@renderer/types/models'

interface Props {
  student: StudentWithRelations
  age: number
}

const props = defineProps<Props>()

const infoSections = [
  {
    icon: Mail,
    label: 'Email',
    value: props.student.email
  },
  {
    icon: Phone,
    label: 'Phone',
    value: props.student.phone
  },
  {
    icon: Calendar,
    label: 'Age',
    value: `${props.age} years`
  },
  {
    icon: GraduationCap,
    label: 'Grade',
    value: props.student.grade.name
  },
  {
    icon: Briefcase,
    label: 'Specialty',
    value: props.student.specialty.name
  },
  {
    icon: MapPin,
    label: 'Location',
    value: props.student.address
  }
]
</script>

<template>
  <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
    <!-- Header with Avatar -->
    <div class="bg-linear-to-br from-blue-600/20 to-slate-700/20 p-6 border-b border-slate-700/50">
      <div class="flex items-center gap-4">
        <div
          class="w-24 h-24 rounded-full bg-linear-to-br from-blue-700/40 to-blue-600/50 flex items-center justify-center text-3xl font-bold text-white shrink-0 ring-2 ring-white/50"
        >
          {{ student.name.charAt(0) }}
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-white mb-1">{{ student.name }}</h1>
          <p class="text-slate-300 text-sm font-mono">{{ student.code }}</p>
        </div>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(item, index) in infoSections"
          :key="index"
          class="flex items-start gap-3 p-4 rounded-lg bg-slate-900/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
        >
          <div
            class="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center shrink-0"
          >
            <component :is="item.icon" class="w-5 h-5 text-slate-400" :stroke-width="2" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs text-slate-500 mb-1">{{ item.label }}</p>
            <p class="text-sm text-slate-200 wrap-break-words">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
