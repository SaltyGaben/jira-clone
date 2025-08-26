<script setup lang="ts">
import { CircleCheckBig, Clock, GitPullRequestArrow, List } from 'lucide-vue-next'
import type { Tables } from '~/types/database.types'

type Ticket = Tables<'tickets'>

const { tickets } = defineProps<{
    tickets: Ticket[]
}>()

const todo = computed(() =>
    tickets.filter(ticket => ticket.ticket_status === 'todo').length
)
const completed = computed(() =>
    tickets.filter(ticket => ticket.ticket_status === 'done').length
)
const inProgress = computed(() =>
    tickets.filter(ticket => ticket.ticket_status === 'in_progress').length
)
const inReview = computed(() =>
    tickets.filter(ticket => ticket.ticket_status === 'in_review').length
)


</script>

<template>
    <div class="w-full flex flex-row gap-6 px-4">
        <Card class="w-full">
            <CardHeader class="flex flex-row gap-4 items-center my-auto">
                <List class="w-10 h-10 text-blue-600" />
                <div>
                    <CardTitle class="text-3xl">{{ todo }}</CardTitle>
                    <CardDescription>
                        Tasks To Do
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card class="w-full">
            <CardHeader class="flex flex-row gap-4 items-center my-auto">
                <Clock class="w-10 h-10 text-yellow-500" />
                <div>
                    <CardTitle class="text-3xl">{{ inProgress }}</CardTitle>
                    <CardDescription>
                        Tasks In Progress
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card class="w-full">
            <CardHeader class="flex flex-row gap-4 items-center my-auto">
                <GitPullRequestArrow class="w-10 h-10 text-purple-900" />
                <div>
                    <CardTitle class="text-3xl">{{ inReview }}</CardTitle>
                    <CardDescription>
                        Tasks In Review
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card class="w-full">
            <CardHeader class="flex flex-row gap-4 items-center my-auto">
                <CircleCheckBig class="w-10 h-10 text-green-700" />
                <div>
                    <CardTitle class="text-3xl">{{ completed }}</CardTitle>
                    <CardDescription>
                        Completed Tasks
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
    </div>
</template>