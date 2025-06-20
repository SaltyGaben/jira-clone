<script setup lang="ts">
import { type Tables, type Enums } from '~/types/database.types';


interface TicketProps {
    ticket: Tables<'tickets'>;
}

const props = defineProps < TicketProps > ()

const statusDisplayText = computed(() => {
    switch (props.ticket.ticket_status) {
        case 'todo': return 'To Do';
        case 'in_progress': return 'In Progress';
        case 'in_review': return 'In Review';
        case 'done': return 'Done';
        default: return 'Unknown'; // Should not happen with well-defined ENUM
    }
});

const emit = defineEmits(['updateStatus']);

const handleStatusChange = (newStatus: Enums<'ticket_status'>) => {
    emit('updateStatus', props.ticket.id, newStatus);
}
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>

            </CardTitle>
        </CardHeader>
    </Card>
</template>