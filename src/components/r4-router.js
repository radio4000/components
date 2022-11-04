import { html, render } from 'lit-html'
import page from 'page/page.mjs'

export default class R4Router extends HTMLElement {
	static get observedAttributes() {
		return ['href', 'channel']
	}
	/* used to build the base of links and app router */
	get href() {
		return this.getAttribute('href')
	}
	/* used to setup the base of the url handled by page.js router */
	get pathname() {
		const href = this.href || window.location.href
		let name = new URL(href).pathname
		if (name.endsWith('/')) {
			name = name.slice(0, name.length - 1)
		}
		return name
	}
	connectedCallback() {
		const $routes = this.querySelectorAll('r4-route')
		this.setupRouter()
		this.setupRoutes($routes)
		this.handleFirstUrl()
	}
	handleFirstUrl() {
		page(window.location)
	}

	setupRouter() {
		page.stop()
		page.strict(false)
		if (this.pathname) {
			page.base(this.pathname)
		} else {
			page.base('')
		}
	}

	setupRoutes($routes) {
		$routes.forEach(this.setupRoute.bind(this))
	}
	setupRoute($route) {
		page($route.getAttribute('path'), this.parseQuery, (ctx, next) => this.renderRoute($route, ctx, next))
		page.exit($route.getAttribute('path'), (ctx, next) => this.unrenderRoute($route, ctx, next))
	}

	parseQuery(ctx, next) {
		const params = []
		const urlParams = new URLSearchParams(ctx.querystring)
		if (urlParams) {
			for (const urlParam of urlParams) {
				urlParam && params.push(urlParam)
			}
		}
		ctx.query = params
		next()
	}

	renderRoute($route, ctx, next) {
		console.log('render $route', $route)
		const pageName = $route.getAttribute('page')
		const $page = document.createElement(`r4-page-${pageName}`)
		Array.from($route.attributes).filter(attribute => {
			return ['path', 'page'].indexOf(attribute) === -1
		}).forEach(attribute => {
			$page.setAttribute(attribute.nodeName, attribute.nodeValue)
		})
		$page.setAttribute('href', this.href)
		render($page, this)
	}
	unrenderRoute($route, ctx, next) {
		console.log('unrender $route', $route)
		next()
	}
}
