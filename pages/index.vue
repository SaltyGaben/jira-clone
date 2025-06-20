<script setup lang="ts">
import Column from '~/components/Column.vue'
import type { Tables, Enums } from '~/types/database.types';

const allTickets = ref<Tables<'tickets'>[]>([]);

const columnStatuses: Enums<'ticket_status'>[] = ['todo', 'in_progress', 'in_review', 'done'];
const columnTitles: Record<Enums<'ticket_status'>, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
};

const todoTickets = computed(() => allTickets.value.filter(t => t.ticket_status === 'todo'));
const inProgressTickets = computed(() => allTickets.value.filter(t => t.ticket_status === 'in_progress'));
const inReviewTickets = computed(() => allTickets.value.filter(t => t.ticket_status === 'in_review'));
const doneTickets = computed(() => allTickets.value.filter(t => t.ticket_status === 'done'));

const ticketsByStatus = computed<Record<Enums<'ticket_status'>, Tables<'tickets'>[]>>(() => {
    const map: Record<Enums<'ticket_status'>, Tables<'tickets'>[]> = {
        todo: [],
        in_progress: [],
        in_review: [],
        done: [],
    };
    allTickets.value.forEach(ticket => {
        if (ticket.ticket_status) {
            map[ticket.ticket_status].push(ticket);
        }
    });
    return map;
});
</script>

<template>
    <div class="h-11/12 w-full flex flex-row justify-evenly p-8 gap-8">
        <Column v-for="status in columnStatuses" :title="columnTitles[status]" :key="status"
            :tickets="ticketsByStatus[status]" />
    </div>
</template>