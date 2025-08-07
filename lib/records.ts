import type { Enums } from '~/types/database.types'

type TicketPriority = Enums<'ticket_priority'>
type TicketStatus = Enums<'ticket_status'>

export const priorityColor: Record<TicketPriority, string> = {
	low: '#D0F0D8',
	medium: '#FFECB3',
	high: '#FFCC80',
	critical: '#EF9A9A'
}

export const statusNames: Record<TicketStatus, string> = {
	todo: 'Todo',
	in_progress: 'In Progress',
	in_review: 'In Review',
	done: 'Done'
}

export const ticketTypes = {
	bug: 'Bug',
	epic: 'Epic',
	task: 'Task'
} as const

export const priorityNames: Record<TicketPriority, string> = {
	low: 'Low',
	medium: 'Medium',
	high: 'High',
	critical: 'Critical'
}

export const typeNames: Record<TicketType, string> = {
	bug: 'Bug',
	epic: 'Epic',
	task: 'Task'
}

export const typeColor: Record<TicketType, string> = {
	bug: '#D0F0D8',
	epic: '#FFECB3',
	task: '#FFCC80'
}

export type TicketType = keyof typeof ticketTypes
