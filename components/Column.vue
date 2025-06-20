<script setup lang="ts">
import type { Tables, Enums } from '~/types/database.types'; // Import Tables and Enums

interface ColumnProps {
    title: string;
    tickets: Tables<'tickets'>[]; // <--- Array of fully typed ticket objects!
}

const props = defineProps<ColumnProps>();

// Define emits to pass up events from tickets
const emit = defineEmits(['updateTicketStatus']);

const handleTicketStatusUpdate = (ticketId: string, newStatus: Enums<'ticket_status'>) => {
    emit('updateTicketStatus', ticketId, newStatus); // Pass the event up to Board
}

</script>

<template>
    <Card class="h-full w-full bg-muted shadow-none">
        <CardHeader>
            <CardTitle class="place-self-center text-2xl">
                {{ title }}
            </CardTitle>
        </CardHeader>
        <CardContent>

        </CardContent>
    </Card>
</template>