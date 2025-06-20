<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { toast } from 'vue-sonner'
import { Loader2, Eye, EyeOff } from 'lucide-vue-next'
import * as z from 'zod'
import type { Database } from '~/types/database.types'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()
const router = useRouter()

definePageMeta({
    layout: 'no-navbar',
});

watch(user, () => {
    if (user.value) {
        // Get redirect path, and clear it from the cookie
        const path = redirectInfo.pluck()
        // Redirect to the saved path, or fallback to home
        return navigateTo(path || '/')
    }
}, { immediate: true })

const email = ref('')
const password = ref('')
const loading = ref(false)
const isPasswordVisible = ref(false)

const emailFormSchema = toTypedSchema(z.object({
    email: z.string().email(),
    password: z.string(),
}))

const { isFieldDirty, handleSubmit } = useForm({
    validationSchema: emailFormSchema
})

const onSubmitEmail = handleSubmit(async (values) => {
    loading.value = true
    email.value = values.email

    const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })

    if (error) {
        toast.error('Unexpected error', {
            description: error.message,
        })
    } else {
        router.push('/register')
    }

    loading.value = false
})

const goToRegisterPage = () => {
    router.push('/register')
}
</script>

<template>
    <div class="bg-background h-screen container mx-auto justify-center items-center flex max-w-90 mb-40">
        <Card class="w-full">
            <CardHeader>
                <CardTitle class="text-2xl">Login</CardTitle>
            </CardHeader>
            <form @submit.prevent="onSubmitEmail">
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
                </CardContent>
                <CardFooter class="flex flex-col gap-2 mt-6">
                    <Button v-if="loading" type="submit" disabled class="w-full">
                        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                    </Button>
                    <Button v-else type="submit" class="w-full">Login</Button>
                    <Button variant="ghost" class="hover:bg-transparent" @click="goToRegisterPage">
                        <p class="text-xs underline hover:cursor-pointer">Don't have an
                            account?
                            Register here</p>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
</template>
