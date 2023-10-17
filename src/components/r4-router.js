import {LitElement} from 'lit'
import {html, literal, unsafeStatic} from 'lit/static-html.js'
import page from 'page/page.mjs'

/**
Here is an example of how the r4-router works.

<r4-router>
	<r4-route page="/animals"></r4-route>
	<r4-route page="/colors/:color"></r4-route>
</r4-router>

The `page` attribute decides which web component to render. It requires the name to be: `r4-page-${page}`.

All routes are passed the following props:
- `store` - the global store
- `config` - the config object
- `params` - dynamic params of the current URL, as defined on th route
- `searchParams` - a URLSearchParams object from the current url
*/

// https://github.com/visionmedia/page.js/issues/537
page.configure({window: window})

export default class R4Router extends LitElement {
	static properties = {
		store: {type: Object, state: true},
		config: {type: Object, state: true},
		routes: {type: Array, state: true},
	}

	/* used to setup the base of the url handled by page.js router */
	get pathname() {
		const href = this.config.href || window.location.href
		const name = new URL(href).pathname
		return name
	}

	connectedCallback() {
		this.setupRouter()
		this.setupRoutes()
		this.handleFirstUrl()
		super.connectedCallback()
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

	setupRoutes() {
		if (this.routes?.length) {
			this.routes.forEach(this.setupRoute.bind(this))
		}
	}

	setupRoute(route) {
		const {path} = route
		page(path, this.parseContext.bind(this), (ctx) => this.renderRoute(route, ctx))
		page.exit(path, (ctx, next) => this.unrenderRoute(route, ctx, next))
	}

	parseContext(ctx, next) {
		ctx.searchParams = new URLSearchParams(ctx.querystring)
		next()
	}

	handleFirstUrl() {
		const initialURL = new URL(window.location.href)
		const url = initialURL.pathname + initialURL.search
		page(url)
	}

	// Called by page.js when a route is matched.
	renderRoute(route, ctx) {
		const {page} = route
		/* console.info('render route') */
		this.params = ctx.params
		this.searchParams = ctx.searchParams
		/* console.info('ctx.params', ctx.searchParams) */
		this.componentName = `r4-page-${page}`
		// Schedules a new render.
		this.requestUpdate()
	}

	render() {
		if (!this.componentName) return
		const tag = literal`${unsafeStatic(this.componentName)}`
		// eslint-disable-next-line
		const $pageDom = html`<${tag} .store=${this.store} .config=${this.config} .searchParams=${this.searchParams} .params=${this.params}></${tag}>`
		return $pageDom
	}

	unrenderRoute(route, ctx, next) {
		/* console.info('unrender route', route, ctx) */
		next()
	}

	createRenderRoot() {
		return this
	}
}
