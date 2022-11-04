import { html, render } from 'lit-html'
import { readChannelTracks } from '@radio4000/sdk'
import page from 'page/page.mjs'
import '../pages/index.js'

// https://github.com/visionmedia/page.js/issues/537
/* page.configure({ window: window }) */

/* the app template */
const template = document.createElement('template')
template.innerHTML = `
	<r4-layout>
		<header slot="header"></header>
		<main slot="main"></main>
		<aside slot="player">
			<r4-player></r4-player>
		</aside>
	</r4-layout>
`

export default class R4App extends HTMLElement {
	static get observedAttributes() {
		return ['href', 'channel']
	}
	/* used to build the base of links and app router */
	get href() {
		let hrefAttr = this.getAttribute('href') || window.location.href
		if (hrefAttr.endsWith('/')) {
			hrefAttr = hrefAttr.slice(0, hrefAttr.length - 1)
		}
		return hrefAttr
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
	/* if there is a channel slug,
		 the app will adapt to run only for one channel  */
	get channel() {
		return this.getAttribute('channel')
	}
	attributeChangedCallback(attrName) {
		if (attrName === 'href') {
			this.setupRouter()
		}
	}
	connectedCallback() {
		this.append(template.content.cloneNode(true))
		this.$slotHeader = this.querySelector('[slot="header"]')
		this.$slotMain = this.querySelector('[slot="main"]')
		this.$slotPlayer = this.querySelector('[slot="player"]')
		this.$player = this.$slotPlayer.querySelector('r4-player')

		this.addEventListeners()
		this.renderSlots()

		/* setup the routes so they are ready to handle URL navigation */
		this.setupRouter()
		this.handleFirstUrl()
	}

	addEventListeners() {
		this.addEventListener('r4-play', this.onPlay.bind(this))
	}

	setupRouter() {
		/* this.setupCLickHandler() */

		if (this.pathname) {
			/* Get or set the base path. For example if page.js is operating within /blog/* set the base path to "/blog".
				 its value is the value of `new URL(window.location).pathname` when on `/` of the app */

			page.base(this.pathname)

			/* Get or set the strict path matching mode to enable.If enabled / blog will not match "/blog/" and / blog / will not match "/blog". */
			page.strict(false)
		}
		this.setupRoutes()
	}
	/* the routes/pages handlers */
	setupRoutes() {
		/* first wildcard, used as a first middleware
			 (calls next, to continue with the next handlers) */
		page('*', (ctx, next) => {
			console.log('navigated *', ctx)
			next()
		})

		/* if the app has a channel slug specified, render the channel
			 otherwise render general homepage */
		if (this.channel) {
			this.setupRoutesChannel()
		} else {
			this.setupRoutesPlatform()
		}
	}

	/* setup all routes, when the app is used for all channels,
	 as the radio4000.com platform */
	setupRoutesPlatform() {
		page('/', () => this.renderPage('home'))
		page('/explore', () => this.renderPage('explore'))

		page('/sign', () => this.renderPage('sign'))
		page('/sign/up', () => this.renderPage('sign', [['method', 'up']]))
		page('/sign/in', () => this.renderPage('sign', [['method', 'in']]))
		page('/sign/out', () => this.renderPage('sign', [['method', 'out']]))

		page('/add', this.parseQuery, (ctx) => {
			this.renderPage('add', ctx.query)
		})

		page('/:channel_slug', (ctx) => {
			const { channel_slug } = ctx.params
			this.renderPage('channel', [
				['slug', channel_slug],
				['limit', 5],
				['pagination', false]
			])
		})
		page('/:channel_slug/tracks', (ctx) => {
			const { channel_slug } = ctx.params
			this.renderPage('channel', [
				['slug', channel_slug],
				['limit', 30],
				['pagination', true]
			])
		})
		page('/:channel_slug/tracks/:track_id', (ctx) => {
			const { channel_slug, track_id } = ctx.params
			this.renderPage('channel', [
				['slug', channel_slug],
				['limit', 1],
				['pagination', false],
				['track', track_id]
			])
		})

		/* last wildcard, used as a 404 catch all (no next)) */
		page('*', (ctx,) => {
			console.log('404 ?')
		})
	}
	/* setup the routes for when a r4-app[slug] is specified,
	 so the app is setup for only this channel */
	setupRoutesChannel() {
		page('/', () => {
			this.renderPage('channel', [
				['slug', this.channel],
				['limit', 5],
				['pagination', false]
			])
		})
		page('/sign', () => page('/'))
		page('/sign/in', () => this.renderPage('sign', [['method', 'in']]))
		page('/sign/out', () => this.renderPage('sign', [['method', 'out']]))
		page('/add', this.parseQuery, (ctx) => {
			this.renderPage('add', [...ctx.query, ['slug', this.channel]])
		})
		page('/tracks', () => {
			this.renderPage('channel', [
				['slug', this.channel],
				['limit', 300],
				['pagination', true]
			])
		})
		page('/tracks/:track_id', (ctx) => {
			const { track_id } = ctx.params
			this.renderPage('channel', [
				['slug', this.channel],
				['track', track_id]
			])
		})
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

	setupCLickHandler() {
		this.addEventListener('click', this.handleClick.bind(this))
	}
	handleClick(event) {
		const wrappingAnchor = event.target.closest('a')
		if (wrappingAnchor && wrappingAnchor.tagName === 'A') {
			const destination = this.pathname + wrappingAnchor.pathname
			event.preventDefault()
			page(destination)
		}
	}
	handleFirstUrl() {
		page(window.location)
	}

	/* build the app's dom elements */
	buildAppMenu() {
		if (this.channel) {
			return this.buildAppMenuChannel()
		} else {
			return this.buildAppMenuPlatform()
		}
	}
	/* when on slug.4000.network */
	buildAppMenuChannel() {
		const $menu = document.createElement('r4-menu')
		$menu.setAttribute('direction', 'row')
		$menu.setAttribute('origin', this.href)
		render(html`
			<a href="${this.href}">
				${this.channel}
			</a>
			<r4-auth-status>
				<span slot="in">
					<a href="${this.href + '/sign/out'}">sign out</a>
				</span>
				<span slot="out">
					<a href="${this.href + '/sign/in'}">sign in</a>
				</span>
			</r4-auth-status>
		`, $menu)
		return $menu
	}
	/* when on radio4000.com */
	buildAppMenuPlatform() {
		/* the menu */
		const $menu = document.createElement('r4-menu')
		$menu.setAttribute('direction', 'row')
		$menu.setAttribute('origin', this.href)
		render(html`
			<a href="${this.href}">
				<r4-title small="true"></r4-title>
			</a>
			<a href="${this.href + '/explore'}">Explore</a >
			<r4-auth-status>
				<span slot="in">
					<r4-user-channels-select></r4-user-channels-select> <a href="${this.href + '/sign/out'}">sign out</a>
				</span>
				<span slot="out">
					sign-{<a href="${this.href + '/sign/in'}">in</a>, <a href="${this.href + '/sign/up'}">up</a>}
				</span>
			</r4-auth-status>
		`, $menu)
		return $menu
	}

	/* render the original content of the slots */
	renderSlots() {
		const $menu = this.buildAppMenu()
		const $channelSelect = $menu.querySelector('r4-user-channels-select')
		if ($channelSelect) {
			$channelSelect.addEventListener(
				'input',
				this.onChannelSelect.bind(this)
			)
		}
		this.$slotHeader.append($menu)
	}

	/* each time URL changes and needs to render a page */
	renderPage(pageName, attributes) {
		const $page = document.createElement(`r4-page-${pageName}`)
		if (attributes) {
			attributes.forEach(attribute => {
				$page.setAttribute(attribute[0], attribute[1])
			})
		}
		if (this.href) {
			$page.setAttribute('href', this.href)
			if (this.channel) {
				$page.setAttribute('single-channel', true)
			}
		}
		render($page, this.$slotMain)
	}

	/* events */
	onChannelSelect({detail, target}) {
		if (detail.channel) {
			const { slug } = detail.channel
			page(`/${slug}`)
		}
	}

	/* play some data */
	async onPlay({detail}) {
		const {channel} = detail
		if (channel) {
			const { data } = await readChannelTracks(channel)
			if (data) {
				this.$player.setAttribute('tracks', JSON.stringify(data))
			} else {
				this.$player.removeAttribute('tracks')
			}
		}
	}
}
