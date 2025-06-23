<script setup lang="ts">
import { useUserStore } from '~/stores/UserStore';
import type { Database, Tables } from '~/types/database.types';

const userStore = useUserStore();
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const availableTeams = ref<Tables<'teams'>[]>([]);
const selectedTeamId = ref<string | null>(null);
const availableBoards = ref<Tables<'boards'>[]>([]);
const selectedBoardId = ref<string | null>(null);

onMounted(() => {
    if (userStore.teamId) {
        selectedTeamId.value = userStore.teamId
    }
    if (userStore.boardId) {
        selectedBoardId.value = userStore.boardId
    }
    fetchAvailableTeams();
});

const fetchAvailableTeams = async () => {
    if (!user.value) {
        return
    }

    try {
        const { data, error: fetchTeamsError } = await supabase
            .from('team_members')
            .select('team:teams(*)')
            .eq('user_id', user.value.id)

        if (fetchTeamsError) {
            throw fetchTeamsError;
        }

        availableTeams.value = data.map(member => member.team) as Tables<'teams'>[]
    } catch (err: any) {
        console.error('Error fetching available teams:', err.message);
    }
}

const getBoardsForTeam = async (teamId: string) => {
    if (!user.value || !teamId) {
        return
    }

    try {
        const { data, error: fetchBoardError } = await supabase
            .from('boards')
            .select('*')
            .eq('team_id', teamId)

        if (fetchBoardError) {
            throw fetchBoardError
        }

        availableBoards.value = data.map(board => board) as Tables<'boards'>[]
    }
    catch (err: any) {
        console.error('Error fetching available boards:', err.message);
    }
}

watch(selectedTeamId, async (teamId) => {
    if (teamId) {
        userStore.teamId = teamId
        await getBoardsForTeam(teamId);
    } else {
        availableBoards.value = [];
    }
})

watch(selectedBoardId, async (boardId) => {
    if (boardId) {
        userStore.boardId = boardId
    }
})
</script>

<template>
    <nav class="bg-background flex flex-row items-center px-4 h-16 border-b justify-between">
        <h1 class="text-xl">Jira Clone</h1>
        <div class="flex flex-row gap-4">
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
        </div>
    </nav>
</template>