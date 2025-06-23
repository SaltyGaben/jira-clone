import { useStorage } from '@vueuse/core'

export const useUserStore = defineStore('user', () => {
	const boardId = useStorage('boardId', '')
	const teamId = useStorage('teamId', '')

	return { boardId, teamId }
})
