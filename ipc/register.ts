import { registerAuthHandlers } from './handlers/auth.handlers'
import { registerStudentHandlers } from './handlers/student.handlers'
import { registerActivityHandlers } from './handlers/activity.handlers'
import { registerSkillHandlers } from './handlers/skill.handlers'
import { registerEvaluationHandlers } from './handlers/evaluation.handlers'
import { registerAcademicHandlers } from './handlers/academic.handlers'

export const registerIpcHandlers = (): void => {
  registerAuthHandlers()
  registerStudentHandlers()
  registerActivityHandlers()
  registerSkillHandlers()
  registerEvaluationHandlers()
  registerAcademicHandlers()
}
