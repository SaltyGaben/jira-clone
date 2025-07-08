// composables/useTicketAdded.js
export const useTicketAdded = () => {
	// The key 'ticket_added_flag' ensures this state is shared across components
	return useState('ticket_added_flag', () => 0)
}
