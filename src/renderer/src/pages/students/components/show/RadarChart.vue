<script setup lang="ts">
import {
  getOuterTriangle,
  getRadarTrianglePoints,
  getVertexPosition
} from '@renderer/lib/geometry.utils'

import { getRatingColor } from '@renderer/lib/format.utils'

interface Metrics {
  softSkillsAverage: number
  hardSkillsAverage: number
  engagementScore: number
  getDataPoints: { x: number; y: number }[]
  overallRating: number
  activitiesCount: number
}

//eslint-disable-next-line
const { metrics } = defineProps<{ metrics: Metrics }>()
const {
  softSkillsAverage,
  hardSkillsAverage,
  engagementScore,
  getDataPoints,
  overallRating,
  activitiesCount
} = metrics
</script>
<template>
  <!-- Performance Metrics with Triangle Radar -->
  <div class="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
    <h2 class="text-sm font-semibold text-slate-300 mb-6">Performance Overview</h2>

    <!-- Legend -->
    <div class="flex justify-end gap-6 mb-4">
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full" style="background-color: #a855f7"></span>
        <span class="text-xs text-slate-300">Soft Skills</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full" style="background-color: #06b6d4"></span>
        <span class="text-xs text-slate-300">Hard Skills</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full" style="background-color: #10b981"></span>
        <span class="text-xs text-slate-300">Engagement</span>
      </div>
    </div>

    <div class="flex items-center justify-center gap-12">
      <!-- Triangle Radar Chart -->
      <div class="shrink-0">
        <svg viewBox="0 0 100 100" class="w-64 h-64">
          <!-- Grid lines (3 levels) -->
          <polygon
            v-for="level in [33, 66, 100]"
            :key="`grid-${level}`"
            :points="getRadarTrianglePoints(level, level, level, 35)"
            fill="none"
            stroke="#334155"
            stroke-width="0.5"
            opacity="0.3"
          />

          <!-- Axis lines from center to vertices -->
          <line
            x1="50"
            y1="50"
            :x2="getVertexPosition(0, 35, 0).x"
            :y2="getVertexPosition(0, 35, 0).y"
            stroke="#475569"
            stroke-width="0.5"
            opacity="0.5"
          />
          <line
            x1="50"
            y1="50"
            :x2="getVertexPosition(1, 35, 0).x"
            :y2="getVertexPosition(1, 35, 0).y"
            stroke="#475569"
            stroke-width="0.5"
            opacity="0.5"
          />
          <line
            x1="50"
            y1="50"
            :x2="getVertexPosition(2, 35, 0).x"
            :y2="getVertexPosition(2, 35, 0).y"
            stroke="#475569"
            stroke-width="0.5"
            opacity="0.5"
          />

          <!-- Outer triangle border -->
          <polygon :points="getOuterTriangle(35)" fill="none" stroke="#475569" stroke-width="1" />

          <!-- Data triangle (filled) -->
          <polygon
            :points="
              getRadarTrianglePoints(softSkillsAverage, hardSkillsAverage, engagementScore, 35)
            "
            fill="url(#triangleGradient)"
            opacity="0.3"
          />

          <!-- Data triangle (outline) -->
          <polygon
            :points="
              getRadarTrianglePoints(softSkillsAverage, hardSkillsAverage, engagementScore, 35)
            "
            fill="none"
            stroke="#3b82f6"
            stroke-width="1"
          />

          <!-- Vertex points -->
          <circle
            v-for="(point, i) in getDataPoints"
            :key="`point-${i}`"
            :cx="point.x"
            :cy="point.y"
            r="2.5"
            :fill="['#a855f7', '#06b6d4', '#10b981'][i]"
            stroke="white"
            stroke-width="0.5"
          />

          <!-- Labels -->
          <g>
            <!-- Soft Skills (Top) -->
            <text
              :x="getVertexPosition(0, 35, 8).x"
              :y="getVertexPosition(0, 35, 8).y"
              text-anchor="middle"
              fill="#a855f7"
              class="text-[10px] font-bold"
            >
              {{ softSkillsAverage }}
            </text>

            <!-- Hard Skills (Bottom Right) -->

            <text
              :x="getVertexPosition(1, 35, 12).x"
              :y="getVertexPosition(1, 35, 12).y"
              text-anchor="middle"
              fill="#06b6d4"
              class="text-[10px] font-bold"
            >
              {{ hardSkillsAverage }}
            </text>

            <!-- Engagement (Bottom Left) -->
            <text
              :x="getVertexPosition(2, 35, 12).x"
              :y="getVertexPosition(2, 35, 12).y"
              text-anchor="middle"
              fill="#10b981"
              class="text-[10px] font-bold"
            >
              {{ engagementScore }}
            </text>
          </g>

          <!-- Gradient definition -->
          <defs>
            <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #a855f7; stop-opacity: 1" />
              <stop offset="50%" style="stop-color: #3b82f6; stop-opacity: 1" />
              <stop offset="100%" style="stop-color: #10b981; stop-opacity: 1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Overall Rating -->
      <div class="flex flex-col items-center">
        <p class="text-xs text-slate-400 uppercase tracking-wide mb-2">Overall Rating</p>
        <div class="text-6xl font-bold mb-2" :style="{ color: getRatingColor(overallRating) }">
          {{ overallRating }}
        </div>
        <p class="text-xs text-slate-500">{{ activitiesCount }} activities total</p>
      </div>
    </div>
  </div>
</template>
