<script setup lang="ts">
import type { Tables } from '~/types/database.types';

const user = useSupabaseUser()

type Ticket = Tables<'tickets'>
type User = Tables<'users'>

const { tickets } = defineProps<{
    tickets: Ticket[]
    teamMembers: User[]
}>()

const createdTickets = computed(() => {
    return tickets.filter(ticket => ticket.created_by_user === user.value?.id)
})

</script>

<template>
    <div class="grid grid-cols-3 gap-4 p-4 bg-muted rounded-b-xl">
        <div v-for="ticket in createdTickets" :key="ticket.id" class="w-full">
            <Ticket :ticket="ticket" :team-members="teamMembers" />
        </div>
    </div>
</template>