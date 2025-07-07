export default defineNuxtRouteMiddleware((to, from) => {
	const user = useSupabaseUser()

	const allowedRoutes = ['/login', '/register', '/password/reset', '/password/update']

	if (!user.value && !allowedRoutes.includes(to.path)) {
		return navigateTo('/login')
	}

	if (user.value && allowedRoutes.includes(to.path)) {
		return navigateTo('/')
	}
})
