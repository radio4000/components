import { LitElement, render } from 'lit'
import {html, literal, unsafeStatic} from 'lit/static-html.js'
import page from 'page/page.mjs'

export default class R4Router extends LitElement {
	static properties = {
		href: { type: String, reflect: true },
		channel: { type: String, reflect: true },
		page: { type: String, reflect: true },
		path: { type: String, reflect: true },
		method: { type: String, reflect: true },

		store: { type: Object, state: true }
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
		console.log('router connected store', this.store)
		this.setupRouter()
		this.setupRoutes($routes)
		this.handleFirstUrl()
		super.connectedCallback()
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
		page($route.getAttribute('path'), this.parseQuery, (ctx, next) => this.renderRoute($route, ctx))
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

	renderRoute($route, ctx) {
		this.pageName = $route.getAttribute('page')
		this.method = $route.getAttribute('method')
		this.params = ctx.params

		// @todo make this work again
		// const routeQueryParams = $route.getAttribute('query-params')
		// const requestedParams = routeQueryParams ? routeQueryParams.split(',') : []
		// if (requestedParams && ctx.query) {
		// 	ctx.query
		// 		 .filter(param => requestedParams.indexOf(param) > -1)
		// 		 .forEach(param => {
		// 			 $page.setAttribute(param[0], param[1])
		// 		 })
		// }

		this.requestUpdate()
	}

	render() {
		const tag = literal`r4-page-${unsafeStatic(this.pageName)}`
		return html`
			<${tag} .store=${this.store} href=${this.href} method=${this.method} slug=${this.params.slug} track-id=${this.params.track_id}></${tag}>
		`
	}

	unrenderRoute($route, ctx, next) {
		console.log('unrender $route', $route)
		next()
	}

	createRenderRoot() {
		return this
	}
}
