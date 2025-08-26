export default defineNuxtRouteMiddleware(async (to) => {
    // Skip on server-side
    if (import.meta.env.SSR) return

    const userStore = useUserStore()

    // Don't validate on auth pages
    if (!['/login', '/register'].includes(to.path)) {
        await userStore.validateStoredIds()
    }
})
