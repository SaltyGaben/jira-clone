import type { Tables } from '~/types/database.types'

type Users = Tables<'users'>

export function useTeamMembers() {
	const { getTeamMembersFromTeamId } = useUsers()
	const userStore = useUserStore()

	const fetchTeamMembers = async (): Promise<Users[]> => {
		await userStore.validateStoredIds()

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

	const useTeamMembersData = () => {
		return useAsyncData('team-members', fetchTeamMembers)
	}

	return {
		fetchTeamMembers,
		useTeamMembersData
	}
}
