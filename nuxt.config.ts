import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2025-05-15',
	devtools: { enabled: true },
	modules: ['@nuxtjs/supabase', 'shadcn-nuxt', '@pinia/nuxt'],
	css: ['~/assets/css/tailwind.css'],
	vite: {
		plugins: [tailwindcss()]
	},
	shadcn: {
		prefix: '',
		componentDir: './components/ui'
	},
	supabase: {
		redirectOptions: {
			login: '/login',
			callback: '/',
			saveRedirectToCookie: true,
			exclude: ['/register', '/password/reset', '/password/update']
		}
	},
	pinia: {
		storesDirs: ['./stores/**']
	}
})
