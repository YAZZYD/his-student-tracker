<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { LoginSchema } from '@/schemas/auth.schema'
const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(LoginSchema)
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit((values) => {
  console.log('Login values:', values)
})
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-slate-900">
    <Card
      class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur shadow-xl"
    >
      <CardHeader class="space-y-2 text-center">
        <CardTitle class="text-2xl font-semibold text-slate-100"> Welcome back </CardTitle>
        <CardDescription class="text-slate-400"> Sign in to continue </CardDescription>
      </CardHeader>

      <CardContent>
        <form class="space-y-5" @submit="onSubmit">
          <div class="space-y-1.5">
            <Label for="username" class="text-sm text-slate-300"> username </Label>
            <Input
              id="username"
              v-model="username"
              v-bind="usernameAttrs"
              type="username"
              placeholder="you@example.com"
              class="h-11 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
              :class="{ 'border-red-500': errors.username }"
            />
            <p v-if="errors.username" class="text-xs text-red-500">
              {{ errors.username }}
            </p>
          </div>

          <div class="space-y-1.5">
            <Label for="password" class="text-sm text-slate-300"> Password </Label>
            <Input
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              type="password"
              placeholder="••••••••"
              class="h-11 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
              :class="{ 'border-red-500': errors.password }"
            />
            <p v-if="errors.password" class="text-xs text-red-500">
              {{ errors.password }}
            </p>
          </div>

          <Button
            type="submit"
            class="h-11 w-full rounded-lg bg-slate-100 text-slate-900 hover:bg-white transition"
          >
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
