<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { LoginSchema } from '@/schemas/auth.schema'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import type { ResponseSchema as Response } from '@/schemas/response.schema'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { router } from '@renderer/router'
import { useAuth } from '@renderer/stores/auth'
import { Lock, User as UserIcon } from 'lucide-vue-next'
import { useToast } from '@renderer/composables/useToast'

const auth = useAuth()
const toast = useToast()
const { handleSubmit, errors, defineField, setFieldError } = useForm({
  validationSchema: toTypedSchema(LoginSchema)
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    const res: Response = await window.api.auth.authenticate(values.username, values.password)
    if (!res.success) {
      setFieldError('username', 'Invalid username or password')
      return
    }
    auth.login(values.username)
    router.push({ name: 'student-index' })
  } catch (err: any) {
    toast.showToast(err?.message || 'Error')
  }
})
</script>

<template>
  <div class="w-full max-w-md">
    <!-- Logo/Brand -->
    <div class="flex flex-col items-center">
      <img
        src="@renderer/assets/his.png"
        alt="HIS Logo"
        class="w-32 h-32 rounded-lg object-cover"
      />
    </div>

    <!-- Login Card -->
    <Card
      class="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl shadow-2xl"
    >
      <CardHeader class="space-y-2 pb-6">
        <CardTitle class="text-xl font-semibold text-slate-100">Login to your account</CardTitle>
        <CardDescription class="text-slate-400">Enter your credentials to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <form class="space-y-5" @submit="onSubmit">
          <!-- Username Field -->
          <div class="space-y-2">
            <Label for="username" class="text-sm font-medium text-slate-300">Username</Label>
            <div class="relative">
              <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="username"
                v-model="username"
                v-bind="usernameAttrs"
                placeholder="Enter your username"
                class="h-11 pl-10 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                :class="{
                  'border-red-500 focus:border-red-500 focus:ring-red-500/20': errors.username
                }"
              />
            </div>
            <p v-if="errors.username" class="text-xs text-red-400 flex items-center gap-1">
              <span class="inline-block w-1 h-1 rounded-full bg-red-400"></span>
              {{ errors.username }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium text-slate-300">Password</Label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="password"
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                placeholder="Enter your password"
                class="h-11 pl-10 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                :class="{
                  'border-red-500 focus:border-red-500 focus:ring-red-500/20': errors.password
                }"
              />
            </div>
            <p v-if="errors.password" class="text-xs text-red-400 flex items-center gap-1">
              <span class="inline-block w-1 h-1 rounded-full bg-red-400"></span>
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            class="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-200"
          >
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
