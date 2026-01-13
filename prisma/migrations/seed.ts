import { prisma } from '../../config/prisma'
import {
  activitySeeder,
  adminSeeder,
  gradeSpecialtySeeder,
  evaluationSeeder,
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
  await evaluationSeeder()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
