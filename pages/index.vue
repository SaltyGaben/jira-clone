<script setup lang="ts">
import type { DragendEventData } from '@formkit/drag-and-drop'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import type { Enums, Tables } from '~/types/database.types'
import { useTicketAdded, useTickets } from "~/composables/useTickets";
import { statusNames } from '~/lib/records'

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const userStore = useUserStore()
const ticketAddedFlag = useTicketAdded();
const { getAllTickets } = useTickets()

type TicketStatus = Enums<"ticket_status">
type Ticket = Tables<"tickets">

const allTickets = ref<Ticket[]>([])

const todoItems = ref<Ticket[]>([])
const inProgressItems = ref<Ticket[]>([])
const inReviewItems = ref<Ticket[]>([])
const doneItems = ref<Ticket[]>([])

const updateStatus = async (
    data: DragendEventData<Ticket>,
) => {
    const ticket = data.draggedNode.data.value

    const newStatus = data.parent.el.id as TicketStatus

    console.log("ticket: ", ticket)
    if (!ticket || ticket.ticket_status === newStatus) return

    try {
        const { error } = await supabase
            .from('tickets')
            .update({ ticket_status: newStatus })
            .eq('id', ticket.id)

        if (error) throw error

        ticket.ticket_status = newStatus
    } catch (err) {
        console.error('Failed to update ticket status:', err)
    }
}


const [todoRef, todoList] = useDragAndDrop<Ticket>(todoItems.value, { group: "todoList", onDragend: updateStatus as any })
const [inProgressRef, inProgressList] = useDragAndDrop<Ticket>(inProgressItems.value, { group: "todoList", onDragend: updateStatus as any })
const [inReviewRef, inReviewList] = useDragAndDrop<Ticket>(inReviewItems.value, { group: "todoList", onDragend: updateStatus as any })
const [doneRef, doneList] = useDragAndDrop<Ticket>(doneItems.value, { group: "todoList", onDragend: updateStatus as any })


const listRefs: Record<TicketStatus, Ref<HTMLElement | undefined>> = {
    todo: todoRef,
    in_progress: inProgressRef,
    in_review: inReviewRef,
    done: doneRef,
}

const itemsByStatus: Record<TicketStatus, Ref<Ticket[]>> = {
    todo: todoList,
    in_progress: inProgressList,
    in_review: inReviewList,
    done: doneList,
}

const listsByStatus = {
    todo: todoItems,
    in_progress: inProgressItems,
    in_review: inReviewItems,
    done: doneItems,
}

const columnStatuses: TicketStatus[] = ["todo", "in_progress", "in_review", "done"]
const isBoardSelected = ref(true)

onMounted(async () => {
    if (!userStore.boardId) {
        return
    }
    isBoardSelected.value = true
    getTickets()
})

const getTickets = async () => {
    if (!user.value || !isBoardSelected.value) {
        return
    }

    try {
        const data = await getAllTickets()

        allTickets.value = []
        todoItems.value.splice(0, todoItems.value.length)
        inProgressItems.value.splice(0, inProgressItems.value.length)
        inReviewItems.value.splice(0, inReviewItems.value.length)
        doneItems.value.splice(0, doneItems.value.length)

        allTickets.value = data ?? []

        allTickets.value.forEach((ticket) => {
            if (ticket.ticket_status && listsByStatus[ticket.ticket_status]) {
                listsByStatus[ticket.ticket_status].value.push(ticket)
            }
        })
        console.log('ticket gotten');
    } catch (error) {
        console.error('Failed to load tickets:', error);
    }
}

watch(() => userStore.boardId, async (boardId) => {
    if (!boardId) {
        return
    }

    isBoardSelected.value = true
    getTickets()
})

watch(ticketAddedFlag, async (newValue, oldValue) => {
    if (newValue !== 0) {
        console.log('get tickets');

        await getTickets()
    }
});


const getEpicName = (epicId: string | null) => {
    if (!epicId) return

    const epicTicket = allTickets.value.find(ticket => ticket.id === epicId)
    return epicTicket ? epicTicket.title : undefined
}

</script>

<template>
    <div v-if="isBoardSelected" class="h-full w-full flex flex-row justify-evenly p-8 gap-3">
        <Card v-for="status in columnStatuses" :key="status" class="h-full w-full bg-muted shadow-none border-none">
            <CardHeader>
                <CardTitle class="place-self-center text-2xl">
                    {{ statusNames[status] }}
                </CardTitle>
            </CardHeader>


            <CardContent class="px-2 h-full overflow-auto">
                <ul :ref="(el) => (listRefs[status].value = el as HTMLElement)" :id="status"
                    class="h-full flex flex-col gap-2">
                    <li v-for="ticket in itemsByStatus[status].value" :key="ticket.id">
                        <Ticket :ticket="ticket" :epic-name="getEpicName(ticket.epic_ticket_id)" />
                    </li>
                </ul>
            </CardContent>

        </Card>
    </div>
    <div v-else class="flex items-center justify-center">
        <h1 class="text-3xl">No board is Selected</h1>
    </div>
</template>