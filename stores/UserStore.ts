import { useStorage } from '@vueuse/core'

export const useUserStore = defineStore('user', () => {
	const boardId = useStorage('boardId', '')
	const teamId = useStorage('teamId', '')
	const isInitialized = ref(false)

	const validateStoredIds = async () => {
		if (isInitialized.value) return true
		const { getUserTeams } = useUsers()
		const { fetchBoardsForTeam } = useBoards()

		try {
			const userTeams = await getUserTeams()

			if (teamId.value && !userTeams.some((team) => team.id === teamId.value)) {
				teamId.value = ''
				boardId.value = ''
				isInitialized.value = true
				return false
			}

			//Fallback to first team and board if stored teamId is empty
			if (!teamId.value && userTeams.length > 0) {
				const firstTeam = userTeams[0]
				if (firstTeam?.id) {
					teamId.value = firstTeam.id
					if (!boardId.value) {
						const boards = await fetchBoardsForTeam(firstTeam.id)
						if (boards.length > 0 && boards[0]?.id) {
							boardId.value = boards[0].id
						}
					}
				}
			}

			isInitialized.value = true
			return true
		} catch (error) {
			console.error('Error validating stored IDs:', error)
			teamId.value = ''
			boardId.value = ''
			isInitialized.value = true
			return false
		}
	}

	const clearStoredIds = () => {
		teamId.value = ''
		boardId.value = ''
		isInitialized.value = false
	}

	return {
		boardId,
		teamId,
		validateStoredIds,
		clearStoredIds,
		isInitialized
	}
})
