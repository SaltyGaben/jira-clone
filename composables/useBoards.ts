import type { Database, Tables } from '~/types/database.types'

type Board = Tables<'boards'>

export function useBoards() {
	const supabase = useSupabaseClient<Database>()
	const user = useSupabaseUser()

	const fetchBoardsForTeam = async (teamId: string): Promise<Board[]> => {
		if (!teamId) {
			return []
		}
		const { data, error } = await supabase.from('boards').select('*').eq('team_id', teamId)

		if (error) {
			throw error
		}
		return data as Board[]
	}

	return {
		fetchBoardsForTeam
	}
}
