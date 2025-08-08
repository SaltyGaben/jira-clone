import type { Tables } from '~/types/database.types'
import { tryCatch } from '~/lib/utils'

type Ticket = Tables<'tickets'>

export function useEpicTickets() {
	const { getEpicTickets } = useTickets()

	const fetchEpicTickets = async (): Promise<Ticket[]> => {
		const { data, error } = await tryCatch(getEpicTickets())
		if (error) {
			console.error('Failed to fetch epic tickets:', error)
			return []
		}
		return data ?? []
	}

	const useEpicTicketsData = () => {
		return useAsyncData('epic-tickets', fetchEpicTickets)
	}

	return {
		fetchEpicTickets,
		useEpicTicketsData
	}
}
