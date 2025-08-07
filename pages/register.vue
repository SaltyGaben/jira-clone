<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Loader2, Eye, EyeOff } from 'lucide-vue-next'
import * as z from 'zod'
import { toast } from 'vue-sonner'

const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()

definePageMeta({
    layout: 'no-navbar',
})

watch(user, () => {
    if (user.value) {
        const path = redirectInfo.pluck()
        return navigateTo(path || '/')
    }
}, { immediate: true })

const supabase = useSupabaseClient()
const router = useRouter()

const loading = ref(false)
const isPasswordVisible = ref(false)

const userSetupFormSchema = toTypedSchema(z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string(),
    displayName: z.string()
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }))

const { isFieldDirty, handleSubmit, errors } = useForm({
    validationSchema: userSetupFormSchema
})

const onSubmitUserSetup = handleSubmit(async (values) => {
    loading.value = true

    try {
        const { error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                data: {
                    display_name: values.displayName
                }
            }
        })

        if (error) {
            console.error('Profile update error:', error.message)
            toast.error('Profile update error', {
                description: error.message
            })
        } else {
            router.push('/')
        }
    } catch (err) {
        toast.error('An unexpected error occurred during profile update.')
    } finally {
        toast.success('Account has been created successfully. Welcome!')
        loading.value = false
    }
})

const goToLoginPage = () => {
    router.push('/login')
}
</script>

<template>
    <div class="bg-background h-screen container mx-auto justify-center items-center flex max-w-90 mb-40">
        <Card class="w-full max-w-80">
            <CardHeader>
                <CardTitle class="text-2xl">Register</CardTitle>
            </CardHeader>
            <form @submit.prevent="onSubmitUserSetup">
                <CardContent class="flex flex-col gap-4">
                    <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Email" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
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
                    <FormField v-slot="{ componentField }" name="displayName" :validate-on-blur="!isFieldDirty">
                        <FormItem>
                            <FormLabel>Your display name</FormLabel>
                            <FormControl class="">
                                <Input type="text" placeholder="Name" v-bind="componentField" />
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
                    <Button v-else type="submit" class="w-full">Register</Button>
                    <Button variant="ghost" class="hover:bg-transparent" @click="goToLoginPage">
                        <p class="text-xs underline hover:cursor-pointer">Already have an account? Login here</p>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
</template>
