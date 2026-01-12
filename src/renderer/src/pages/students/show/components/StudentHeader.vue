<script setup lang="ts">
import type { StudentWithRelations } from '@renderer/types/models'

interface Props {
  student: StudentWithRelations
  age: number
}

//eslint-disable-next-line
const props = defineProps<Props>()
</script>

<template>
  <!-- Profile Section -->
  <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
    <div class="flex items-start gap-6">
      <div
        class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
      >
        {{ student.name.charAt(0) }}
      </div>
      <div class="flex-1">
        <h1 class="text-xl font-semibold text-white mb-1">{{ student.name }}</h1>
        <p class="text-slate-400 text-xs mb-4 font-mono">{{ student.code }}</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-xs">
          <div>
            <p class="text-slate-500">Email</p>
            <p class="text-slate-300">{{ student.email }}</p>
          </div>
          <div>
            <p class="text-slate-500">Age</p>
            <p class="text-slate-300">{{ age }} years</p>
          </div>
          <div>
            <p class="text-slate-500">Grade</p>
            <p class="text-slate-300">{{ student.grade.name }}</p>
          </div>
          <div>
            <p class="text-slate-500">Specialty</p>
            <p class="text-slate-300">{{ student.specialty.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
