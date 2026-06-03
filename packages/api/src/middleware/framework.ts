import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

export type Framework = 'react' | 'vue' | 'angular';

export type AppEnv = { Variables: { framework: Framework } };

const VALID_FRAMEWORKS: Framework[] = ['react', 'vue', 'angular'];

export const frameworkMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	const cookie = getCookie(c, 'framework');
	const framework: Framework = VALID_FRAMEWORKS.includes(cookie as Framework)
		? (cookie as Framework)
		: 'react';
	c.set('framework', framework);
	await next();
});
