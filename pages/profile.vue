<script setup lang="ts">
import { ArrowLeft, Mail } from 'lucide-vue-next'
import type { Tables } from '~/types/database.types'

definePageMeta({
    layout: 'no-navbar',
})

type User = Tables<'users'>
type Ticket = Tables<'tickets'>

const router = useRouter()
const userStore = useUserStore()
const user = useSupabaseUser()

const tickets = ref<Ticket[]>([])
const currentUser = ref<User>()

const { getUserById, getTeamMembersFromTeamId } = useUsers()
const { getAllTickets } = useTickets()

onMounted(async () => {
    if (user.value && user.value?.id) {
        currentUser.value = await getUserById(user.value.id)
    }
    tickets.value = await getAllTickets()
})

const teamMembers = ref<User[]>([])

watchEffect(async () => {
    if (userStore.teamId) {
        teamMembers.value = await getTeamMembersFromTeamId(userStore.teamId)
    }
})

const refreshUserData = async () => {
    if (user.value && user.value?.id) {
        currentUser.value = await getUserById(user.value.id)
    }
}

const getUserInitials = (displayName: string): string => {
    if (!displayName?.trim()) return ''
    const names = displayName.trim().split(' ').filter(Boolean)
    if (names.length === 0) return ''
    const first = names[0]
    const last = names[names.length - 1]
    if (!first) return ''
    if (names.length === 1) {
        return first.charAt(0).toUpperCase()
    }
    if (!last) return first.charAt(0).toUpperCase()
    return first.charAt(0).toUpperCase() + last.charAt(0).toUpperCase()
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
            <ProfileCards :tickets="tickets" />
        </div>
        <div class="px-4 mt-8">
            <Tabs default-value="assigned" class="w-full gap-0">
                <TabsList class="w-full rounded-none rounded-t-lg">
                    <TabsTrigger value="assigned" class="w-full">Assigned</TabsTrigger>
                    <TabsTrigger value="created" class="w-full">Created</TabsTrigger>
                    <TabsTrigger value="settings" class="w-full">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="assigned">
                    <AssignedTasksTab :tickets="tickets" :team-members="teamMembers" />
                </TabsContent>
                <TabsContent value="created">
                    <CreatedTasksTab :tickets="tickets" :team-members="teamMembers" />
                </TabsContent>
                <TabsContent value="settings" v-if="currentUser">
                    <SettingsTab :user-data="currentUser" @user-updated="refreshUserData" />
                </TabsContent>
            </Tabs>
        </div>
    </div>
</template>