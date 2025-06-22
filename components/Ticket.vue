<script setup lang="ts">
import { type Tables, type Enums } from '~/types/database.types';

type Ticket = Tables<"tickets">;

interface TicketProps {
    ticket: Ticket;
}

const props = defineProps<TicketProps>()

</script>

<template>
    <Card class="shadow-none border-none">
        <CardHeader>
            <CardTitle>
                {{ ticket.title }}
            </CardTitle>
        </CardHeader>
    </Card>
</template>