import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'

export type Framework = 'react' | 'vue' | 'angular'

const VALID_FRAMEWORKS: Framework[] = ['react', 'vue', 'angular']

export const frameworkMiddleware = createMiddleware(async (c, next) => {
	const cookie = getCookie(c, 'framework')
	const framework: Framework = VALID_FRAMEWORKS.includes(cookie as Framework)
		? (cookie as Framework)
		: 'react'
	c.set('framework', framework)
	await next()
})
