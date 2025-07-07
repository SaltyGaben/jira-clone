import { useStorage } from '@vueuse/core'
import type { Tables } from '~/database.types'

type TeamMembers = Tables<'team_members'>

export const useUserStore = defineStore('user', () => {
	const boardId = useStorage('boardId', '')
	const teamId = useStorage('teamId', '')
	const teamMembers: TeamMembers[] = []

	return { boardId, teamId, teamMembers }
})
