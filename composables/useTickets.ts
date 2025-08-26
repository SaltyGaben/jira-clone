import type { Database, Tables } from '~/types/database.types'

type Ticket = Tables<'tickets'>
type NewTicket = Database['public']['Tables']['tickets']['Insert']
type InsertComment = Database['public']['Tables']['comments']['Insert']
type UpdateTicket = Database['public']['Tables']['tickets']['Update']
type Comment = Tables<'comments'>
type User = Tables<'users'>

type CommentWithUser = Comment & {
	users: User
}

export function useTickets() {
	const { getUserById } = useUsers()
	const supabase = useSupabaseClient()
	const user = useSupabaseUser()
	const userStore = useUserStore()

	const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
		const { data, error } = await supabase.from('tickets').select('*').eq('ticket_id_str', ticketId).limit(1).single()

		if (error) {
			console.error(`Error fetching ticket ${ticketId}:`, error.message)
			throw error
		}
		return data as Ticket
	}

	const getTicketByDbId = async (id: string): Promise<Ticket | null> => {
		const { data, error } = await supabase.from('tickets').select('*').eq('id', id).limit(1).single()

		if (error) {
			throw error
		}

		return data as Ticket
	}

	const getAllTickets = async (): Promise<Ticket[]> => {
		const { data, error: fetchTeamsError } = await supabase.from('tickets').select('*').eq('board_id', userStore.boardId)

		if (fetchTeamsError) {
			throw fetchTeamsError
		}

		return data as Ticket[]
	}

	const getEpicTickets = async () => {
		const { data, error } = await supabase.from('tickets').select('*').eq('ticket_type', 'epic')

		if (error) {
			throw error
		}

		return data as Ticket[]
	}

	const saveTicket = async (ticket: NewTicket) => {
		const { data, error: saveTicketError } = await supabase.from('tickets').insert(ticket).select()

		if (saveTicketError) {
			throw saveTicketError
		}

		return data[0] as Ticket
	}

	const updateTicket = async (ticketId: string, updatedTicket: UpdateTicket) => {
		const { data, error } = await supabase.from('tickets').update(updatedTicket).eq('id', ticketId).select().single()

		if (error) {
			throw error
		}

		return data as Ticket
	}

	const getComments = async (ticketId: string): Promise<CommentWithUser[]> => {
		const { data, error } = await supabase
			.from('comments')
			.select(
				`
				*,
				users (
					id,
					display_name,
					email
				)
			`
			)
			.eq('ticket_id', ticketId)
			.order('created_at', { ascending: true })

		if (error) {
			throw error
		}

		return data as CommentWithUser[]
	}

	const saveComment = async (comment: InsertComment): Promise<CommentWithUser> => {
		const { data, error } = await supabase
			.from('comments')
			.insert(comment)
			.select(
				`
				*,
				users (
					id,
					display_name,
					email
				)
			`
			)
			.single()

		if (error) {
			throw error
		}

		return data as CommentWithUser
	}

	const getTicketAssignedToUser = async (userId: string): Promise<Ticket[]> => {
		const { data, error } = await supabase.from('tickets').select('*').eq('assigned_user', userId)
		if (error) {
			throw error
		}
		return data as Ticket[]
	}

	const useTicketAssignedToUser = () => useAsyncData<Ticket[]>('tickets_assigned_to_user', async () => {
		if (!user.value?.id) return []
		return getTicketAssignedToUser(user.value.id)
	})

	const getAssignedUserForTicket = async (ticketId: string): Promise<User | null> => {
		const { data: ticketData, error: ticketError } = await supabase
			.from('tickets')
			.select('assigned_user')
			.eq('id', ticketId)
			.single()
		if (ticketError) {
			throw ticketError
		}

		return ticketData.assigned_user ? getUserById(ticketData.assigned_user) : null
	}

	return {
		getAllTickets,
		getTicketById,
		getTicketByDbId,
		getEpicTickets,
		saveTicket,
		updateTicket,
		getComments,
		saveComment,
		getTicketAssignedToUser,
		useTicketAssignedToUser,
		getAssignedUserForTicket
	}
}

export const useTicketAdded = () => {
	return useState('ticket_added_flag', () => 0)
}
