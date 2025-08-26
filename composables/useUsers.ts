import type { Tables } from '~/types/database.types'

type Users = Tables<'users'>
type Team = Tables<'teams'>

export function useUsers() {
	const supabase = useSupabaseClient()
	const user = useSupabaseUser()

	const getTeamMembersFromTeamId = async (teamId?: string): Promise<Users[]> => {
		if (!teamId) {
			return []
		}

		const { data, error } = await supabase.from('team_members').select('users(*)').eq('team_id', teamId)

		if (error) {
			throw error
		}

		return data.map((item) => item.users) as Users[]
	}

	const getUserTeams = async (): Promise<Team[]> => {
		if (!user.value) {
			throw createError({ statusCode: 401, statusMessage: 'Unauthorized: User not logged in' })
		}
		const { data, error } = await supabase.from('team_members').select('team:teams(*)').eq('user_id', user.value.id)

		if (error) {
			throw error
		}

		return data.map((member) => member.team) as Team[]
	}

	const updateUser = async (userData: Partial<Users>): Promise<Users> => {
		if (!user.value) {
			throw createError({ statusCode: 401, statusMessage: 'Unauthorized: User not logged in' })
		}
		const { data, error } = await supabase
			.from('users')
			.update(userData)
			.eq('id', user.value.id)
			.select()
			.single()

		if (error) {
			throw error
		}

		return data as Users
	}

	const getUserById = async (id: string): Promise<Users> => {
		const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
		if (error) {
			throw error
		}
		return data as Users
	}

	const useUserData = () =>
		useAsyncData<Users | null>('user', async () => {
			if (!user.value?.id) return null
			return getUserById(user.value.id)
		})

	const getUserDataById = (userId: string) =>
		useAsyncData<Users | null>(`user-${userId}`, async () => {
			if (!userId) return null
			return getUserById(userId)
		})

	const deleteUser = async (userId: string): Promise<void> => {
		const { error } = await supabase.from('users').delete().eq('id', userId)
		if (error) {
			throw error
		}
	}

	return {
		getTeamMembersFromTeamId,
		getUserTeams,
		getUserById,
		useUserData,
		getUserDataById,
		updateUser,
		deleteUser
	}
}
