<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import type { Tables, Enums } from '~/types/database.types';
import type { DragAndDrop, DragendEvent } from "@formkit/drag-and-drop";

type TicketStatus = Enums<"ticket_status">;
type Ticket = Tables<"tickets">;

const props = defineProps<{
    title: string;
    status: TicketStatus;
    tickets: Ticket[];
}>();

const emit = defineEmits<{
    (e: "status-changed", payload: { ticketId: string; newStatus: TicketStatus }): void;
}>();

const [parent, values] = useDragAndDrop<Ticket>(props.tickets, {
    group: "tickets",
});
</script>

<template>
    <Card class="h-full w-full bg-muted shadow-none border-none">
        <CardHeader>
            <CardTitle class="place-self-center text-2xl">
                {{ title }}
            </CardTitle>
        </CardHeader>
        <CardContent class="px-2">
            <Ticket v-for="ticket in values" :key="ticket.id" :ticket="ticket" />
        </CardContent>
    </Card>
</template>