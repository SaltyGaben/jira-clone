<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
    layout: 'no-navbar',
})

const router = useRouter()
const supabase = useSupabaseClient()


const isPasswordVisible = ref(false)
const loading = ref(false)

const passwordResetFormSchema = toTypedSchema(z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }))

const { isFieldDirty, handleSubmit, errors } = useForm({
    validationSchema: passwordResetFormSchema
})

const onSubmitPasswordReset = handleSubmit(async (values) => {
    loading.value = true

    const { data, error } = await supabase.auth.updateUser({
        password: values.password
    })

    if (error) {
        console.error('Password reset error:', error.message)
        toast.error('Password reset error', {
            description: error.message
        })
    }

    loading.value = false
    router.push('/login')
})
</script>

<template>
    <div class="bg-background h-screen container mx-auto justify-center items-center flex max-w-90 mb-40">
        <Card class="w-full">
            <CardHeader>
                <CardTitle class="text-2xl">Login</CardTitle>
            </CardHeader>
            <form @submit.prevent="onSubmitPasswordReset">
                <CardContent class="flex flex-col gap-4">
                    <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div class="relative">
                                    <Input :type="isPasswordVisible ? 'text' : 'password'" placeholder="Password"
                                        v-bind="componentField" />
                                    <button type="button" @click="isPasswordVisible = !isPasswordVisible"
                                        class="absolute end-2 inset-y-0 flex items-center px-2 focus:outline-none hover:cursor-pointer"
                                        tabindex="-1">
                                        <Eye v-if="!isPasswordVisible" class="size-5 text-muted-foreground" />
                                        <EyeOff v-else class="size-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="confirmPassword" :validate-on-blur="!isFieldDirty">
                        <FormItem>
                            <FormLabel>Confirm password</FormLabel>
                            <FormControl>
                                <div class="relative">
                                    <Input :type="isPasswordVisible ? 'text' : 'password'" placeholder="Password"
                                        v-bind="componentField" />
                                    <button type="button" @click="isPasswordVisible = !isPasswordVisible"
                                        class="absolute end-2 inset-y-0 flex items-center px-2 focus:outline-none hover:cursor-pointer"
                                        tabindex="-1">
                                        <Eye v-if="!isPasswordVisible" class="size-5 text-muted-foreground" />
                                        <EyeOff v-else class="size-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </CardContent>
                <CardFooter class="flex flex-col gap-2 mt-6">
                    <Button v-if="loading" type="submit" disabled class="w-full">
                        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                    </Button>
                    <Button v-else type="submit" class="w-full">Reset Password</Button>
                </CardFooter>
            </form>
        </Card>
    </div>
</template>
