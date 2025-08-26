<script setup lang="ts">
import { type Tables } from '~/types/database.types'
import { priorityColor, priorityNames } from '~/lib/records'

const router = useRouter()

type Ticket = Tables<"tickets">
type User = Tables<"users">

interface TicketProps {
    ticket: Ticket
    epicName?: string
    teamMembers: User[]
}

const props = defineProps<TicketProps>()

const assignedUser = computed(() => {
    if (!props.ticket.assigned_user) {
        return null
    }
    return props.teamMembers.find(user => user.id === props.ticket.assigned_user) || null
})

const routeToTicket = (ticketIdString: string | null) => {
    if (!ticketIdString) {
        return
    }
    router.push('/ticket/' + ticketIdString)
}
</script>

<template>
    <Card class="shadow-none border-none p-3 gap-3 hover:cursor-grab">
        <CardHeader class="flex flex-row justify-between p-0">
            <span class="bg-muted px-2 py-1 rounded-sm text-sm">{{ ticket.ticket_id_str }}</span>
            <span class="px-2 py-1 rounded-sm text-sm text-center"
                :style="{ backgroundColor: ticket.ticket_priority ? priorityColor[ticket.ticket_priority] : '#f3f4f6' }">
                {{ ticket.ticket_priority ? priorityNames[ticket.ticket_priority] : 'No Priority' }}
            </span>
        </CardHeader>
        <CardDescription class="flex flex-row justify-between">
            <h1 class="text-black text-xl hover:cursor-pointer" @click="routeToTicket(ticket.ticket_id_str)">{{
                ticket.title }}</h1>
        </CardDescription>
        <CardFooter class="flex justify-end w-full p-0 gap-2">
            <span v-if="assignedUser" class="flex items-center justify-center">
                <span
                    class="rounded-full w-7 h-7 flex items-center justify-center text-white text-sm font-bold bg-gray-400"
                    :title="assignedUser.display_name || assignedUser.email || 'Unassigned'">
                    {{ (assignedUser.display_name || assignedUser.email || '?').charAt(0).toUpperCase() }}
                </span>
            </span>
            <span v-else
                class="rounded-full w-7 h-7 flex items-center justify-center text-gray-400 bg-gray-100 text-sm font-bold"
                title="Unassigned">?</span>
            <span class="bg-muted rounded-full w-9 text-center">{{ ticket.story_points }}</span>
        </CardFooter>
    </Card>
</template>