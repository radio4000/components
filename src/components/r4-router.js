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
		console.log(this.pathname)
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
		const pageName = $route.getAttribute('page')
		const $page = document.createElement(`r4-page-${pageName}`)
		Array.from($route.attributes).filter(attribute => {
			return ['path', 'page'].indexOf(attribute) === -1
		}).forEach(attribute => {
			$page.setAttribute(attribute.nodeName, attribute.nodeValue)
		})
		if (ctx.params) {
			Object.keys(ctx.params).forEach(paramName => {
				$page.setAttribute(paramName.replace('_', '-'), ctx.params[paramName])
			})
		}
		const routeQueryParams = $route.getAttribute('query-params')
		const requestedParams = routeQueryParams ? routeQueryParams.split(',') : []
		if (requestedParams && ctx.query) {
			console.log('ctx.query', ctx.query)
			ctx.query
						 .filter(param => requestedParams.indexOf(param) > -1)
						 .forEach(param => {
							 $page.setAttribute(param[0], param[1])
						 })
		}
		$page.setAttribute('href', this.href)
		console.log('render $page', $page)
		render($page, this)
	}
	unrenderRoute($route, ctx, next) {
		console.log('unrender $route', $route)
		next()
	}
}
