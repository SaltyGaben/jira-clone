import type { Database, Tables } from '~/types/database.types'

type Ticket = Tables<'tickets'>
type NewTicket = Database['public']['Tables']['tickets']['Insert']
type InsertComment = Database['public']['Tables']['comments']['Insert']
type UpdateTicket = Database['public']['Tables']['tickets']['Update']
type Comment = Tables<'comments'>
type User = Tables<'users'>

// Add a new type for comments with user data
type CommentWithUser = Comment & {
	users: User
}

export function useTickets() {
	const supabase = useSupabaseClient()
	const userStore = useUserStore()

	const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
		const { data, error } = await supabase.from('tickets').select('*').eq('ticket_id_str', ticketId).limit(1).single()

		if (error) {
			console.error(`Error fetching ticket ${ticketId}:`, error.message)
			// Re-throw or handle as appropriate for your global error strategy
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

		console.log('commentData: ', data)

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

	return {
		getAllTickets,
		getTicketById,
		getEpicTickets,
		saveTicket,
		updateTicket,
		getComments,
		saveComment
	}
}

export const useTicketAdded = () => {
	// The key 'ticket_added_flag' ensures this state is shared across components
	return useState('ticket_added_flag', () => 0)
}
