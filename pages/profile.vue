<script setup lang="ts">
import { ArrowLeft, Mail } from 'lucide-vue-next'
import type { Tables } from '~/types/database.types'

definePageMeta({
    layout: 'no-navbar',
})

type User = Tables<'users'>

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

const currentUser = ref<User>()

const { useUserData } = useUsers()
const { data: intitalUserData } = await useUserData()

watchEffect(() => {
    if (intitalUserData.value) {
        currentUser.value = intitalUserData.value
    }
})

const getUserInitials = (displayName: string): string => {
    if (!displayName) return ''
    const names = displayName.trim().split(' ')
    if (names.length === 1) {
        return names[0] ? names[0].charAt(0).toUpperCase() : ''
    }
    return (
        names[0].charAt(0).toUpperCase() +
        names[names.length - 1].charAt(0).toUpperCase()
    )
}


</script>

<template>
    <div>
        <div class="border-b h-24 flex flex-row items-center px-3 gap-4">
            <ArrowLeft :size="30" @click="router.push('/')"
                class="hover:cursor-pointer hover:bg-foreground/10 rounded" />
            <div class="flex flex-col gap-1">
                <h1 class="text-3xl font-semibold">Profile</h1>
                <h1 class="text-md text-black/60">Manage your account and view your activity</h1>
            </div>
        </div>
        <div class="p-4 flex flex-row w-full gap-4 mt-4">
            <Card class="w-full">
                <CardHeader class="flex flex-row gap-4 items-center">
                    <span
                        class="h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl">
                        {{ getUserInitials(currentUser?.display_name ? currentUser.display_name : 'U') }}
                    </span>
                    <div class="flex flex-col gap-1">
                        <CardTitle class="text-4xl ">{{ currentUser?.display_name }}</CardTitle>
                        <CardDescription class="flex flex-row gap-1 text-md items-center">
                            <Mail class="w-5 h-5" />
                            {{ currentUser?.email }}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
        <div class="mt-4">
            <ProfileCards />
        </div>
        <div class="px-4 mt-8">
            <Tabs default-value="assigned" class="w-full">
                <TabsList  class="w-full">
                    <TabsTrigger value="assigned" class="w-full">Assigned</TabsTrigger>
                    <TabsTrigger value="created" class="w-full">Created</TabsTrigger>
                    <TabsTrigger value="settings" class="w-full">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="assigned">
                    <AssignedTasksTab />
                </TabsContent>
                <TabsContent value="created">
                    <CreatedTasksTab />
                </TabsContent>
                <TabsContent value="settings">
                    <SettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    </div>
</template>