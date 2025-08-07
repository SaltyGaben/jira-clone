import { useStorage } from '@vueuse/core'

export const useUserStore = defineStore('user', () => {
	const boardId = useStorage('boardId', '')
	const teamId = useStorage('teamId', '')

	const validateStoredIds = async () => {
		const { getUserTeams } = useUsers()

		try {
			const userTeams = await getUserTeams()

			if (teamId.value && !userTeams.some((team) => team.id === teamId.value)) {
				teamId.value = ''
				boardId.value = ''
				return false
			}

			if (!teamId.value && userTeams.length > 0) {
				teamId.value = userTeams[0].id
			}

			return true
		} catch (error) {
			console.error('Error validating stored IDs:', error)
			teamId.value = ''
			boardId.value = ''
			return false
		}
	}

	const clearStoredIds = () => {
		teamId.value = ''
		boardId.value = ''
	}

	return {
		boardId,
		teamId,
		validateStoredIds,
		clearStoredIds
	}
})
