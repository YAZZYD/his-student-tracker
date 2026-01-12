<script setup lang="ts">
import { getRatingColor } from '@renderer/lib/format.utils'
import { SkillAvg } from '@renderer/types/models'

interface Skills {
  softSkills: SkillAvg[]
  hardSkills: SkillAvg[]
}

const { skills } = defineProps<{ skills: Skills }>()
const { softSkills, hardSkills } = skills
</script>
<template>
  <!-- Skills Detail -->
  <div class="grid md:grid-cols-2 gap-4">
    <!-- Soft Skills -->
    <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
      <h3 class="text-sm font-semibold text-slate-300 mb-4">Soft Skills</h3>
      <div v-if="softSkills.length" class="space-y-3">
        <div v-for="item in softSkills" :key="item.skill.id">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-slate-400">{{ item.skill.name }}</span>
            <span class="text-xs font-semibold" :style="{ color: getRatingColor(item.average) }">
              {{ item.average }}
            </span>
          </div>
          <div class="h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :style="{
                width: `${item.average}%`,
                backgroundColor: getRatingColor(item.average)
              }"
            ></div>
          </div>
        </div>
      </div>
      <p v-else class="text-slate-500 text-xs">No data</p>
    </div>

    <!-- Hard Skills -->
    <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
      <h3 class="text-sm font-semibold text-slate-300 mb-4">Hard Skills</h3>
      <div v-if="hardSkills.length" class="space-y-3">
        <div v-for="item in hardSkills" :key="item.skill.id">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-slate-400">{{ item.skill.name }}</span>
            <span class="text-xs font-semibold" :style="{ color: getRatingColor(item.average) }">
              {{ item.average }}
            </span>
          </div>
          <div class="h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :style="{
                width: `${item.average}%`,
                backgroundColor: getRatingColor(item.average)
              }"
            ></div>
          </div>
        </div>
      </div>
      <p v-else class="text-slate-500 text-xs">No data</p>
    </div>
  </div>
</template>
