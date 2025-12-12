import { prisma } from '../../config/prisma'
import {
  activitySeeder,
  adminSeeder,
  gradeSpecialtySeeder,
  ratingSeeder,
  ratingSkillSeeder,
  skillSeeder,
  studentActivitySeeder,
  studentSeeder
} from '../seeders'

async function main(): Promise<void> {
  await adminSeeder()
  await gradeSpecialtySeeder()
  await studentSeeder()
  await activitySeeder()
  await studentActivitySeeder()
  await skillSeeder()
  await ratingSeeder()
  await ratingSkillSeeder()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
