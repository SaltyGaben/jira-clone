<script setup lang="ts">
import { useUserStore } from '~/stores/UserStore'
import AddTicketButton from './AddTicketButton.vue'
import { User } from 'lucide-vue-next'

const userStore = useUserStore()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const selectedTeamId = ref<string | null>(null)
const selectedBoardId = ref<string | null>(null)

const { getUserTeams } = useUsers()
const { fetchBoardsForTeam } = useBoards()

const { data: availableTeams } = await useAsyncData(
    'user-teams',
    async () => {
        try {
            return await getUserTeams()
        } catch (err: any) {
            console.error('Failed to fetch initial teams:', err.message)
            throw err
        }
    }
)

onMounted(async () => {
    await userStore.validateStoredIds()
})

watchEffect(() => {
    if (availableTeams.value && availableTeams.value.length > 0) {
        selectedTeamId.value = userStore.teamId || availableTeams.value[0]?.id || null;
    } else if (availableTeams.value && availableTeams.value.length === 0) {
        selectedTeamId.value = null;
    }
});

const { data: availableBoards } = useAsyncData(
    () => `boards-for-${selectedTeamId.value}`,
    async () => {
        try {
            return await fetchBoardsForTeam(selectedTeamId.value!);
        } catch (err: any) {
            console.error('Failed to fetch boards for team:', err.message)
            throw err
        }
    },
    {
        watch: [selectedTeamId],
        default: () => [],
    }
);

watchEffect(() => {
    if (selectedTeamId.value && userStore.boardId && availableBoards.value) {
        const boardExists = availableBoards.value.some(board => board.id === userStore.boardId);
        if (boardExists) {
            selectedBoardId.value = userStore.boardId;
        } else {
            selectedBoardId.value = availableBoards.value[0]?.id || null;
        }
    } else if (!selectedTeamId.value || !userStore.boardId) {
        selectedBoardId.value = null;
    }
});

watch(selectedTeamId, async (newTeamId) => {
    if (newTeamId) {
        userStore.teamId = newTeamId;
        selectedBoardId.value = null;
    } else {
        selectedBoardId.value = null;
    }
}, { immediate: true });

watch(selectedBoardId, (newBoardId) => {
    if (newBoardId) {
        userStore.boardId = newBoardId;
    }
});

watch(availableBoards, (newBoards) => {
    if (newBoards && newBoards.length > 0 && userStore.boardId) {
        const boardExists = newBoards.some(board => board.id === userStore.boardId);
        if (boardExists) {
            selectedBoardId.value = userStore.boardId;
        } else {
            selectedBoardId.value = newBoards[0]?.id || null;
        }
    }
});

const isLogoutDialogOpen = ref(false)

const logout = async () => {
    userStore.clearStoredIds()
    await supabase.auth.signOut()
    router.push('/login')
}
</script>

<template>
    <nav class="bg-background flex flex-row items-center px-4 h-16 border-b justify-between">
        <h1 class="text-xl hover:cursor-pointer" @click="router.push('/')">Jira Clone</h1>
        <div class="flex flex-row gap-4">
            <AddTicketButton />
            <Select v-model="selectedTeamId">
                <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem v-for="(team, index) in availableTeams" :key="index" :value="team.id">
                            {{ team.name }}
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select v-model="selectedBoardId">
                <SelectTrigger>
                    <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem v-for="(board, index) in availableBoards" :key="index" :value="board.id">
                            {{ board.name }}
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <User class="bg-muted rounded-4xl h-10 w-10 p-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="router.push('/profile')">Profile</DropdownMenuItem>
                    <DropdownMenuItem @click="isLogoutDialogOpen = true">
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </nav>

    <Dialog v-model:open="isLogoutDialogOpen">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Logout</DialogTitle>
                <DialogDescription>
                    Are you sure you want to logout?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button @click="logout">Logout</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>