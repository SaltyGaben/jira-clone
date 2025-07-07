<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
    layout: 'no-navbar',
})

const user = useSupabaseUser()

const redirectInfo = useSupabaseCookieRedirect()
const supabase = useSupabaseClient()
const router = useRouter()

onMounted(() => {
    if (user.value) {
        // Get redirect path, and clear it from the cookie
        const path = redirectInfo.pluck()
        // Redirect to the saved path, or fallback to home
        return navigateTo(path || '/')
    }
})

const loading = ref(false)

const passwordResetFormSchema = toTypedSchema(z.object({
    email: z.string().email()
}))

const { isFieldDirty, handleSubmit, errors } = useForm({
    validationSchema: passwordResetFormSchema
})

const onSubmitPasswordReset = handleSubmit(async (values) => {
    loading.value = true

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
            redirectTo: `${window.location.origin}/password/update`
        })

        if (error) {
            console.error('Password reset error:', error.message)
            toast.error('Password reset error', {
                description: error.message
            })
        }
    } catch (err) {
        toast.error('An unexpected error occurred during profile update.')
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="bg-background h-screen container mx-auto justify-center items-center flex max-w-90 mb-40">
        <Card class="w-full">
            <CardHeader>
                <CardTitle class="text-2xl">Reset Password</CardTitle>
            </CardHeader>
            <form @submit.prevent="onSubmitPasswordReset">
                <CardContent class="flex flex-col gap-4">
                    <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <div class="relative">
                                    <Input type="email" placeholder="Email" v-bind="componentField" />
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
