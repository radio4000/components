import { LitElement } from 'lit'
import { html, literal, unsafeStatic } from 'lit/static-html.js'
import page from 'page/page.mjs'

// https://github.com/visionmedia/page.js/issues/537
page.configure({ window: window })

export default class R4Router extends LitElement {
	static properties = {
		/* props attribute */
		store: { type: Object, state: true },
		config: { type: Object, state: true },
	}

	/* used to setup the base of the url handled by page.js router */
	get pathname() {
		const href = this.config.href || window.location.href
		const name = new URL(href).pathname
		/* if (name.endsWith('/')) {
			 name = name.slice(0, name.length - 1)
			 } */
		return name
	}

	connectedCallback() {
		const $routes = this.querySelectorAll('r4-route')
		// console.log('router connected store', this.store)
		this.setupRouter()
		this.setupRoutes($routes)
		this.handleFirstUrl()
		super.connectedCallback()
	}

	handleFirstUrl() {
		const initialURL = new URL(window.location.href)
		const url = initialURL.pathname + initialURL.search
		page(url)
	}

	setupRouter() {
		page.stop()
		page.strict(false)
		if (this.pathname && this.pathname !== '/') {
			page.base(this.pathname)
		} else {
			page.base('')
		}
	}

	setupRoutes($routes) {
		$routes.forEach(this.setupRoute.bind(this))
	}

	setupRoute($route) {
		page($route.getAttribute('path'), this.parseQuery.bind(this), (ctx) => this.renderRoute($route, ctx))
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

		const pageQuery = {}
		const routeQueryParams = $route.getAttribute('query-params')
		const requestedParams = routeQueryParams ? routeQueryParams.split(',') : []
		if (requestedParams && ctx.query) {
			ctx.query
				.filter((param) => requestedParams.indexOf(param[0]) > -1)
				.forEach((param) => {
					pageQuery[param[0]] = param[1]
				})
			this.query = pageQuery
		}

		this.requestUpdate()
	}

	render() {
		if (!this.pageName) return
		const tag = literal`r4-page-${unsafeStatic(this.pageName)}`
		// eslint-disable-next-line
		const $pageDom = html`<${tag} .store=${this.store} .config=${this.config} .query=${this.query} .params=${this.params}></${tag}>`
		return $pageDom
	}

	unrenderRoute($route, ctx, next) {
		next()
	}

	createRenderRoot() {
		return this
	}
}
