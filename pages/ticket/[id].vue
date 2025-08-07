<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import z from 'zod'
import type { Database, Enums, Tables } from '~/types/database.types'
import { ArrowLeft, PencilLine, X, Save } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { FileText, Info, MessageSquare, User } from 'lucide-vue-next'
import { priorityNames, statusNames, typeNames } from '~/lib/records'

const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()
const userStore = useUserStore()
const { getTicketById, getComments, saveComment, updateTicket } = useTickets()
const { getUserById, getTeamMembersFromTeamId } = useUsers()

const ticketId = route.params.id as string
const isEditing = ref(false)

definePageMeta({
    layout: 'ticket',
})

type Ticket = Tables<'tickets'>
type Comment = Tables<'comments'>
type User = Tables<'users'>
type CommentWithUser = Comment & {
    users: User
}
type InsertComment = Database['public']['Tables']['comments']['Insert']
type TicketStatus = Enums<"ticket_status">
type TicketPriority = Enums<"ticket_priority">

const ticketStatuses: TicketStatus[] = ["todo", "in_progress", "in_review", "done"]
const ticketPriorities: TicketPriority[] = ['low', 'medium', 'high', 'critical']

const ticket = ref<Ticket>()
const ticketComments = ref<CommentWithUser[]>([])
const assignedUser = ref('')
const createdByUser = ref('')
const teamMemberList = ref<User[]>([])

const { data: initialTicket } = await useAsyncData(
    `ticket-${ticketId}`,
    async () => {
        try {
            return await getTicketById(ticketId)
        } catch (error: any) {
            toast.error('Failed to fetch ticket information', {
                description: error.message,
            })
        }
    }
)

const { data: initialTicketComments } = await useAsyncData(
    'comments',
    async () => {
        if (!ticket.value?.id) {
            return []
        }

        try {
            return await getComments(ticket.value.id)
        } catch (error: any) {
            toast.error('Failed to fetch comments', {
                description: error.message,
            })
        }

    },
    {
        immediate: false,
        watch: [() => ticket.value?.id],
        default: () => []
    }
)

// Validate IDs and fetch team members after validation
const { data: teamMembers } = await useAsyncData(
    'team-members',
    async () => {
        // First validate the stored IDs
        await userStore.validateStoredIds()

        // Only fetch team members if we have a valid teamId
        if (userStore.teamId) {
            try {
                return await getTeamMembersFromTeamId(userStore.teamId)
            } catch (error: any) {
                console.error('Failed to fetch team members:', error)
                return []
            }
        }
        return []
    }
)

watchEffect(() => {
    if (initialTicket.value) {
        ticket.value = { ...initialTicket.value }
    }
    if (initialTicketComments.value) {
        ticketComments.value = initialTicketComments.value
    }
    if (teamMembers.value) {
        teamMemberList.value = teamMembers.value
    }
})

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

const ticketForm = useForm({
    validationSchema: ticketSchema,
    validateOnMount: false,
    keepValuesOnUnmount: true
})

watchEffect(() => {
    if (ticket.value && !isEditing.value) {
        ticketForm.setValues({
            title: ticket.value.title,
            description: ticket.value.description || '',
            status: ticket.value.ticket_status,
            priority: ticket.value.ticket_priority || 'medium',
            type: ticket.value.ticket_type || 'task',
            assignee: ticket.value.assigned_user || '',
            points: ticket.value.story_points || null,
        })
    }
})

const commentText = ref('')

const onSubmitComment = async () => {
    if (!user.value?.id || !ticket.value?.id) {
        return
    }

    const comment: InsertComment =
    {
        content: commentText.value,
        user_id: user.value.id,
        ticket_id: ticket.value?.id
    }

    const insertedComment = await saveComment(comment)

    if (insertedComment) {
        ticketComments.value.push(insertedComment)
        commentText.value = ''
    }
}

watchEffect(async () => {
    if (ticket.value?.assigned_user) {
        try {
            assignedUser.value = (await getUserById(ticket.value.assigned_user)).display_name ?? 'Unknown User'
        } catch (error) {
            console.error('Failed to fetch assignee user:', error)
        }
    }

    if (ticket.value?.created_by_user) {
        try {
            createdByUser.value = (await getUserById(ticket.value.created_by_user)).display_name ?? 'Unknown User'
        } catch (error) {
            console.error('Failed to fetch created by user:', error)
        }
    }
})

const assigneeName = computed(() => {
    return assignedUser.value
})

const createdByName = computed(() => {
    return createdByUser.value
})

const onSubmitTicket = ticketForm.handleSubmit(async (values) => {
    if (!ticket.value?.id) return

    try {
        const updatedTicket = await updateTicket(ticket.value.id, {
            title: values.title,
            description: values.description || null,
            ticket_status: values.status,
            ticket_priority: values.priority,
            ticket_type: values.type,
            assigned_user: values.assignee || null,
            story_points: values.points,
            updated_at: new Date().toISOString(),
        })

        ticket.value = { ...ticket.value, ...updatedTicket }
        isEditing.value = false
        toast.success('Ticket updated successfully')
    } catch (error: any) {
        toast.error('Failed to update ticket', {
            description: error.message,
        })
    }
})
</script>

<template>
    <form>
        <div class="border-b h-24 flex flex-row items-center px-3 gap-4 justify-between">
            <div class="flex flex-row items-center gap-4">
                <ArrowLeft :size="30" @click="router.push('/')"
                    class="hover:cursor-pointer hover:bg-foreground/10 rounded" />
                <div class="flex flex-col gap-1">
                    <FormField v-if="isEditing" v-slot="{ componentField }" name="title">
                        <FormItem>
                            <FormControl>
                                <Input type="text" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <h1 v-else class="text-3xl font-semibold">{{ ticket?.title }}</h1>
                    <h1 class="text-xl text-black/60">{{ ticket?.ticket_id_str }}</h1>
                </div>
            </div>
            <Button v-if="!isEditing" variant="outline" class="hover:cursor-pointer flex items-center gap-3"
                @click="isEditing = !isEditing">
                <PencilLine />
                Edit
            </Button>
            <div v-else class="flex flex-row gap-4">
                <Button class="hover:cursor-pointer flex items-center gap-3" @click="onSubmitTicket">
                    <Save />
                    Save
                </Button>
                <Button variant="outline" class="hover:cursor-pointer flex items-center gap-2"
                    @click="isEditing = !isEditing">
                    <X />
                    Cancel
                </Button>
            </div>

        </div>
        <div class="p-4 flex flex-row w-full gap-4">

            <div class="flex flex-col gap-4 w-full">
                <Card>
                    <CardHeader>
                        <CardTitle class="text-2xl flex flex-row items-center gap-2">
                            <FileText />
                            Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField v-if="isEditing" v-slot="{ componentField }" name="description">
                            <FormItem>
                                <FormControl>
                                    <Textarea v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        <p v-else class="text-lg ">
                            {{ ticket ? ticket.description : 'No description for ticket' }}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle class="text-2xl flex flex-row items-center gap-2">
                            <MessageSquare />
                            Comments ({{ ticketComments.length }})
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="flex flex-col gap-4">
                        <span v-if="ticketComments.length > 0" v-for="comment in ticketComments"
                            class="flex flex-row items-center gap-4">
                            <User class="bg-muted rounded-4xl h-10 w-10 p-2" />
                            <div class="flex flex-col gap-1">
                                <div class="flex items-baseline gap-2">
                                    <span class="font-medium text-md">
                                        {{ comment.users?.display_name || comment.users?.email || 'Unknown User' }}
                                    </span>
                                    <span class="text-xs text-muted-foreground">
                                        {{ new Date(comment.created_at).toLocaleDateString() }}
                                    </span>
                                </div>
                                <span class="text-sm text-muted-foreground">
                                    {{ comment.content }}
                                </span>
                            </div>
                        </span>
                        <p v-else>No comments</p>
                        <Separator class="" />
                    </CardContent>
                    <CardFooter class="flex flex-col w-full gap-4">
                        <Textarea placeholder="Write a comment for the ticket" v-model="commentText" />
                        <Button @click="onSubmitComment" class="max-w-32 place-self-start" type="submit">Add
                            Comment</Button>
                    </CardFooter>
                </Card>
            </div>
            <div class="w-1/2">
                <Card>
                    <CardHeader>
                        <CardTitle class="text-2xl flex flex-row items-center gap-2">
                            <Info />
                            Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="flex flex-col gap-2">
                        <div class="flex flex-col gap-6">
                            <div class="flex flex-col gap-2">
                                <Label class="font-semibold text-muted-foreground">Status</Label>
                                <FormField v-if="isEditing" v-slot="{ componentField }" name="status">
                                    <FormItem>
                                        <Select v-bind="componentField">
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem v-for="status in ticketStatuses" :value="status">
                                                        {{ statusNames[status] }}
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                            <FormMessage />
                                        </Select>
                                    </FormItem>
                                </FormField>
                                <span v-else class="text-sm">{{ ticket?.ticket_status ?
                                    statusNames[ticket.ticket_status] :
                                    'No status' }}</span>
                            </div>
                            <div class="flex flex-col gap-2">
                                <Label class="font-semibold text-muted-foreground">Priority</Label>
                                <FormField v-if="isEditing" v-slot="{ componentField }" name="priority">
                                    <FormItem>
                                        <Select v-bind="componentField">
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem v-for="priority in ticketPriorities" :value="priority">
                                                        {{ priorityNames[priority] }}
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                            <FormMessage />
                                        </Select>
                                    </FormItem>
                                </FormField>
                                <span v-else class="text-sm">{{ ticket?.ticket_priority ?
                                    priorityNames[ticket.ticket_priority]
                                    :
                                    'No priority' }}</span>
                            </div>
                            <div class="flex flex-col gap-2">
                                <Label class="font-semibold text-muted-foreground">Type</Label>
                                <span class="text-sm">{{ ticket?.ticket_type ? typeNames[ticket.ticket_type] :
                                    'No type' }}</span>
                            </div>
                        </div>
                        <Separator class="my-4" />
                        <div class="flex flex-col gap-6">
                            <div class="flex flex-col gap-2">
                                <Label class="font-semibold text-muted-foreground">Assignee</Label>
                                <FormField v-if="isEditing" v-slot="{ componentField }" name="assignee">
                                    <FormItem>
                                        <Select v-bind="componentField">
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem v-for="user in teamMemberList" :value="user.id">
                                                        {{ user.display_name }}
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                            <FormMessage />
                                        </Select>
                                    </FormItem>
                                </FormField>
                                <span v-else class="text-sm">{{ ticket?.assigned_user ? assigneeName
                                    : 'No assignee' }}</span>
                            </div>
                            <div class="flex flex-col gap-2">
                                <Label class="font-semibold text-muted-foreground">Assigned by</Label>
                                <span class="text-sm">{{ ticket?.created_by_user ? createdByName
                                    : 'No assignee' }}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </form>
</template>