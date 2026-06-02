import { ViteSSG } from 'vite-ssg'
import contentData from '../../content/data.json'
import App from './App.vue'
import { setContent } from './composables/useContent'
import { routes } from './router'

export const createApp = ViteSSG(App, { routes }, () => {
	setContent(contentData)
})
