<script setup lang="ts">
import { type Tables, type Enums } from '~/types/database.types'
import { ref, onMounted, watch } from 'vue'
import { priorityColor, priorityNames, typeColor, typeNames } from '~/lib/records'

const supabase = useSupabaseClient()
const router = useRouter()

type Ticket = Tables<"tickets">
type TicketPriority = Enums<'ticket_priority'>
type TicketType = Enums<'ticket_type'>

interface TicketProps {
    ticket: Ticket
    epicName?: string
}

const props = defineProps<TicketProps>()

const assignedUser = ref<{ display_name: string | null; email: string | null } | null>(null)

onMounted(async () => {
    if (props.ticket.assigned_user) {
        const { data, error } = await supabase
            .from('users')
            .select('display_name, email')
            .eq('id', props.ticket.assigned_user)
            .single()
        if (!error && data) {
            assignedUser.value = data
        }
    }
})

watch(() => props.ticket.assigned_user, async (newVal) => {
    if (newVal) {
        const { data, error } = await supabase
            .from('users')
            .select('display_name, email')
            .eq('id', newVal)
            .single()
        if (!error && data) {
            assignedUser.value = data
        } else {
            assignedUser.value = null
        }
    } else {
        assignedUser.value = null
    }
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