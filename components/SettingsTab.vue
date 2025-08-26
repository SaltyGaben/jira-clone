<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { User, Shield } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import z from 'zod'
import type { Tables } from '~/types/database.types'

type User = Tables<'users'>

const { userData } = defineProps<{
    userData: User
}>()

const emit = defineEmits(['userUpdated'])

const { updateUser, deleteUser } = useUsers()

const currentUser = computed(() => userData)
const router = useRouter()

const userSchema = toTypedSchema(z.object({
    display_name: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be at most 50 characters'),
    email: z.string().email('Invalid email address'),
}))

const { isFieldDirty, handleSubmit } = useForm({
    validationSchema: userSchema,
    initialValues: {
        display_name: currentUser.value.display_name ?? '',
        email: currentUser.value.email ?? '',
    }
})

const onSubmit = handleSubmit(async (values) => {
    if (values) {
        await updateUser({
            display_name: values.display_name,
            email: values.email,
        })
        emit('userUpdated')
    }
})

const changePassword = () => {
    router.push('/password/reset')
}

const countdown = ref(3)
const isCountingDown = ref(false)
let countdownInterval: NodeJS.Timeout | null = null

const startCountdown = () => {
    isCountingDown.value = true
    countdown.value = 3
    countdownInterval = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
            clearInterval(countdownInterval!)
            isCountingDown.value = false
        }
    }, 1000)
}

const resetCountdown = () => {
    if (countdownInterval) {
        clearInterval(countdownInterval)
    }
    isCountingDown.value = false
    countdown.value = 3
}

const deleteUserData = async () => {
    deleteUser(currentUser.value.id)
    router.push('/login')
    resetCountdown()
}
</script>

<template>
    <div class="flex flex-row gap-6 p-4 bg-muted rounded-b-xl">
        <Card class="w-full">
            <CardHeader>
                <CardTitle class="flex items-baseline text-3xl gap-2">
                    <User /> Profile Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form @submit="onSubmit" class="flex flex-col gap-4">
                    <FormField v-slot="{ componentField }" name="display_name" :validate-on-blur="!isFieldDirty">
                        <FormItem>
                            <FormLabel>Display name</FormLabel>
                            <FormControl>
                                <Input type="text" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="text" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <Button type="submit">
                        Save
                    </Button>
                </form>
            </CardContent>
        </Card>
        <Card class="w-full">
            <CardHeader>
                <CardTitle class="flex items-baseline text-3xl gap-2">
                    <Shield /> Security
                </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
                <Button variant="outline" @click="changePassword"> Change Password </Button>
                <Dialog>
                    <DialogTrigger>
                        <Button variant="destructive" class="w-full" @click="startCountdown"> Delete Account </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove your
                                data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter class="flex flex-row sm:justify-between justify-between mt-6">
                            <DialogClose as-child>
                                <Button type="button" @click="resetCountdown">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button variant="destructive" v-if="isCountingDown" disabled> {{ countdown }}... </Button>
                            <Button variant="destructive" v-else @click="deleteUserData"> Delete Account </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    </div>
</template>