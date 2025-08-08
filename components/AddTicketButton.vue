<script setup lang="ts">
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Plus } from 'lucide-vue-next'
import { Textarea } from '@/components/ui/textarea'
import type { Database, Enums, Tables } from '~/types/database.types'
import { statusNames, priorityNames, typeNames } from '~/lib/records'

import { useTicketAdded, useTickets } from "~/composables/useTickets";

const ticketAddedFlag = useTicketAdded();
const { saveTicket } = useTickets()
const user = useSupabaseUser()
const userStore = useUserStore()

type Users = Tables<"users">
type Ticket = Tables<'tickets'>
type TicketInsert = Database['public']['Tables']['tickets']['Insert']
type TicketStatus = Enums<"ticket_status">
type TicketPriority = Enums<"ticket_priority">
type TicketType = Enums<'ticket_type'>

const ticketStatuses: TicketStatus[] = ["todo", "in_progress", "in_review", "done"]
const ticketPriorities: TicketPriority[] = ['low', 'medium', 'high', 'critical']
const ticketTypesArray: TicketType[] = ['bug', 'epic', 'task']

const isDialogOpen = ref(false)
const teamMembers = ref<Users[]>([])
const epicTickets = ref<Ticket[]>([])

const ticketSchema = toTypedSchema(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().max(200, 'Maximum of 200 characters allowed').optional().nullable(),
    status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    type: z.enum(['bug', 'epic', 'task']),
    epic: z.string().optional().nullable(),
    points: z.number().optional().nullable(),
    assignee: z.string().optional().nullable(),
}))

const onSubmitTicket = (async (values: any) => {
    const ticket: TicketInsert = {
        title: values.title,
        description: values.description,
        ticket_status: values.status,
        ticket_type: values.type,
        ticket_priority: values.priority,
        story_points: values.points,
        assigned_user: values.assignee,
        board_id: userStore.boardId,
        created_by_user: user.value?.id,
        epic_ticket_id: values.epic ?? null
    }

    try {
        await saveTicket(ticket)
    } catch (error: any) {
        if (error.statusCode === 404) {
            throw createError({ statusCode: 404, statusMessage: `Could not save ticket`, fatal: true });
        }
        throw createError({ statusCode: 500, statusMessage: error.message, fatal: true });
    }

    ticketAddedFlag.value = Date.now();
    isDialogOpen.value = false
})

const { useTeamMembersData } = useTeamMembers()
const { data: initialTeamMembers } = await useTeamMembersData()

const { useEpicTicketsData } = useEpicTickets()
const { data: initialEpicTickets } = await useEpicTicketsData()

watchEffect(() => {
    epicTickets.value = initialEpicTickets.value ?? []
    teamMembers.value = initialTeamMembers.value ?? []
})
</script>

<template>
    <Form v-slot="{ handleSubmit }" as="" :validation-schema="ticketSchema">
        <Dialog v-model:open="isDialogOpen">
            <DialogTrigger as-child>
                <Button>
                    <Plus />
                    Add Ticket
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Ticket</DialogTitle>
                    <DialogDescription>Create a new ticket</DialogDescription>
                </DialogHeader>
                <form id="dialogForm" @submit="handleSubmit($event, onSubmitTicket)">
                    <div class="flex flex-col items-center w-full gap-4 my-4">
                        <FormField v-slot="{ componentField }" name="title">
                            <FormItem class="w-full">
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Title" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="description">
                            <FormItem class="w-full">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Write a description of the ticket" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="status">
                            <FormItem class="w-full">
                                <FormLabel>Status</FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem v-for="status in ticketStatuses" :value="status">{{
                                                    statusNames[status] }}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </FormControl>
                                </Select>
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="priority">
                            <FormItem class="w-full">
                                <FormLabel>Priority</FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Select a priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem v-for="priority in ticketPriorities" :value="priority">{{
                                                    priorityNames[priority] }}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </FormControl>
                                </Select>
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="type">
                            <FormItem class="w-full">
                                <FormLabel>Ticket Type</FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem v-for="type in ticketTypesArray" :value="type">{{
                                                    typeNames[type] }}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </FormControl>
                                </Select>
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="epic">
                            <FormItem class="w-full">
                                <FormLabel>Epic Ticket</FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Select an epic" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <template v-if="epicTickets.length > 0">
                                                    <SelectItem v-for="epic in epicTickets" :key="epic.id"
                                                        :value="epic.id">
                                                        {{ epic.title }}
                                                    </SelectItem>
                                                </template>
                                                <template v-else>
                                                    <div class="px-4 py-2 text-muted-foreground text-sm">
                                                        No epic tickets created
                                                    </div>
                                                </template>
                                            </SelectGroup>
                                        </SelectContent>
                                    </FormControl>
                                </Select>
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="points">
                            <FormItem class="w-full">
                                <FormLabel>Story Points</FormLabel>
                                <FormControl>
                                    <Input type="number" inputmode="numeric" :placeholder="0" v-bind="componentField"
                                        :min="0" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="assignee">
                            <FormItem class="w-full">
                                <FormLabel>Assign user</FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem v-for="user in teamMembers" :value="user.id">{{
                                                    user.display_name || user.email }}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </FormControl>
                                </Select>
                            </FormItem>
                        </FormField>
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" form="dialogForm">Create Ticket</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </Form>
</template>