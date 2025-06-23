<script setup lang="ts">
import type { DragendEventData, DragState, NodeDragEventData } from '@formkit/drag-and-drop'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import type { Enums, Tables } from '~/types/database.types'

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const userStore = useUserStore()

type TicketStatus = Enums<"ticket_status">;
type Ticket = Tables<"tickets">;

const allTickets = ref<Ticket[]>([]); // Your source of truth

const todoItems = ref<Ticket[]>([]);
const inProgressItems = ref<Ticket[]>([]);
const inReviewItems = ref<Ticket[]>([]);
const doneItems = ref<Ticket[]>([]);

const updateStatus = async (
    data: DragendEventData<Ticket>,
) => {
    const ticket = data.draggedNode.data.value

    const newStatus = data.parent.el.id as TicketStatus;

    console.log("ticket: ", ticket)
    if (!ticket || ticket.ticket_status === newStatus) return;

    try {
        const { error } = await supabase
            .from('tickets')
            .update({ ticket_status: newStatus })
            .eq('id', ticket.id);

        if (error) throw error;

        ticket.ticket_status = newStatus;
    } catch (err) {
        console.error('Failed to update ticket status:', err);
    }
};


const [todoRef, todoList] = useDragAndDrop<Ticket>(todoItems.value, { group: "todoList", onDragend: updateStatus as any });
const [inProgressRef, inProgressList] = useDragAndDrop<Ticket>(inProgressItems.value, { group: "todoList", onDragend: updateStatus as any });
const [inReviewRef, inReviewList] = useDragAndDrop<Ticket>(inReviewItems.value, { group: "todoList", onDragend: updateStatus as any });
const [doneRef, doneList] = useDragAndDrop<Ticket>(doneItems.value, { group: "todoList", onDragend: updateStatus as any });


const listRefs: Record<TicketStatus, Ref<HTMLElement | undefined>> = {
    todo: todoRef,
    in_progress: inProgressRef,
    in_review: inReviewRef,
    done: doneRef,
};

const itemsByStatus: Record<TicketStatus, Ref<Ticket[]>> = {
    todo: todoList,
    in_progress: inProgressList,
    in_review: inReviewList,
    done: doneList,
};

const listsByStatus = {
    todo: todoItems,
    in_progress: inProgressItems,
    in_review: inReviewItems,
    done: doneItems,
};

const statusNames: Record<TicketStatus, String> = {
    todo: 'Todo',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
}

const columnStatuses: TicketStatus[] = ["todo", "in_progress", "in_review", "done"];
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
        const { data, error: fetchTeamsError } = await supabase
            .from('tickets')
            .select('*')
            .eq('board_id', userStore.boardId)

        if (fetchTeamsError) {
            throw fetchTeamsError;
        }

        console.log('data', data)

        allTickets.value = data.map(ticket => ticket) as Tables<'tickets'>[]

        allTickets.value.forEach((ticket) => {
            if (ticket.ticket_status && listsByStatus[ticket.ticket_status]) {
                listsByStatus[ticket.ticket_status].value.push(ticket);
            }
        });
    } catch (err: any) {
        console.error('Error fetching available teams:', err.message);
    }
}

watch(() => userStore.boardId, async (boardId) => {
    if (!boardId) {
        return
    }

    isBoardSelected.value = true
    getTickets()
})
</script>

<template>
    <div v-if="isBoardSelected" class="h-full w-full flex flex-row justify-evenly p-8 gap-8">
        <Card v-for="status in columnStatuses" :key="status" class="h-full w-full bg-muted shadow-none border-none">
            <CardHeader>
                <CardTitle class="place-self-center text-2xl">
                    {{ statusNames[status] }}
                </CardTitle>
            </CardHeader>

            <CardContent class="px-2 h-full">
                <ul :ref="(el) => (listRefs[status].value = el as HTMLElement)" :id="status"
                    class="h-full flex flex-col gap-2">
                    <li v-for="ticket in itemsByStatus[status].value" :key="ticket.id">
                        <Ticket :ticket="ticket" />
                    </li>
                </ul>
            </CardContent>
        </Card>
    </div>
    <div v-else class="flex items-center justify-center">
        <h1 class="text-3xl">No board is Selected</h1>
    </div>
</template>