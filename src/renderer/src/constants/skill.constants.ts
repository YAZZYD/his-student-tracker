import { Brain, Settings } from 'lucide-vue-next'
import { FunctionalComponent } from 'vue'

export const SkillTypeMap: Record<string, { icon: FunctionalComponent; style: string }> = {
  SOFT: { icon: Brain, style: 'bg-purple-500/10 text-purple-400' },
  HARD: { icon: Settings, style: 'bg-cyan-500/10 text-cyan-400' }
}
