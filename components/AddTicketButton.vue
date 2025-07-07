<script setup lang="ts">
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Plus } from 'lucide-vue-next'
import { Textarea } from '@/components/ui/textarea'
import type { Enums, Tables } from '~/database.types'

const supabase = useSupabaseClient()
const userStore = useUserStore()

type Users = Tables<"users">
type TeamMember = Tables<'team_members'>
type TicketStatus = Enums<"ticket_status">
type TicketPriority = Enums<"ticket_priority">
const ticketStatuses: TicketStatus[] = ["todo", "in_progress", "in_review", "done"]
const statusNames: Record<TicketStatus, String> = {
    todo: 'Todo',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
}
const ticketPriorities: TicketPriority[] = ['low', 'medium', 'high', 'critical']
const priorityNames: Record<TicketPriority, String> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
}

const teamMembers = ref<Users[]>([])

const ticketSchema = toTypedSchema(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().max(200, 'Maximum of 200 characters allowed'),
    status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    points: z.number(),
    assignee: z.string().min(1, 'Assignee is required'),
}))

const onSubmitTicket = (async (values: any) => {
    console.log(values)
})

onMounted(async () => {
    await fetchUsersFromTeamMembers()
})

const fetchUsersFromTeamMembers = async () => {
    const teamId = userStore.teamId

    try {
        const { data, error } = await supabase
            .from('team_members')
            .select('users(*)')
            .eq('team_id', teamId)

        if (error) {
            throw error
        }
        teamMembers.value = (data || []).map(item => item.users).filter(Boolean) as Tables<'users'>[]

    } catch (err: any) {
        console.error(err)
    }
}
</script>

<template>
    <Form v-slot="{ handleSubmit }" as="" :validation-schema="ticketSchema">
        <Dialog>
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