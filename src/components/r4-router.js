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
		page($route.getAttribute('path'), this.parseContext.bind(this), (ctx) => this.renderRoute($route, ctx))
		page.exit($route.getAttribute('path'), (ctx, next) => this.unrenderRoute($route, ctx, next))
	}

	parseContext(ctx, next) {
		ctx.searchParams = new URLSearchParams(ctx.querystring)
		next()
	}

	renderRoute($route, ctx) {
		this.pageName = $route.getAttribute('page')
		this.method = $route.getAttribute('method')
		this.params = ctx.params
		this.searchParams = ctx.searchParams
		this.requestUpdate()
	}

	render() {
		if (!this.pageName) return
		const tag = literal`r4-page-${unsafeStatic(this.pageName)}`
		// eslint-disable-next-line
		const $pageDom = html`<${tag} .store=${this.store} .config=${this.config} .searchParams=${this.searchParams} .params=${this.params}></${tag}>`
		return $pageDom
	}

	unrenderRoute($route, ctx, next) {
		next()
	}

	createRenderRoot() {
		return this
	}
}
