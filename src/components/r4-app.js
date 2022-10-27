import sdk from '@radio4000/sdk'
import page from 'page/page.mjs'
import '../pages/index.js'

// https://github.com/visionmedia/page.js/issues/537
page.configure({ window: window })

/* the app template */
const template = document.createElement('template')
template.innerHTML = `
	<r4-layout>
		<header slot="header"></header>
		<main slot="main"></main>
		<aside slot="player"></aside>
	</r4-layout>
`

export default class R4App extends HTMLElement {
	static get observedAttributes() {
		return ['origin', 'pathname']
	}
	get origin() {
		return this.getAttribute('origin') || window.origin
	}
	get pathname() {
		return this.getAttribute('pathname') || '/'
	}
	get appUrl() {
		return this.origin + this.pathname
	}

	attributeChangedCallback(attrName) {
		if (attrName === 'pathname') {
			this.setupRouter()
		}
	}
	connectedCallback() {
		this.append(template.content.cloneNode(true))
		this.$slotHeader = this.querySelector('[slot="header"]')
		this.$slotMain = this.querySelector('[slot="main"]')
		this.$slotPlayer = this.querySelector('[slot="player"]')

		/* setup the routes so they are ready to handle URL navigation */
		this.setupRouter()
		this.setupRoutes()
		this.renderSlots()
		this.handleFirstUrl()
	}

	setupRouter() {
		if (this.pathname) {
			page.base(this.pathname)
		}
	}
	/* the routes/pages handlers */
	setupRoutes() {
		/* first wildcard, used as a first middleware
			 (calls next, to continue with the next handlers) */
		page('*', (ctx, next) => {
			console.log('navigated *', ctx)
			next()
		})

		page('/', (ctx, next) => {
			this.renderPage('home')
		})

		page('explore', (ctx, next) => {
			this.renderPage('explore')
		})

		page(':channel_slug', (ctx, next) => {
			const { channel_slug } = ctx.params
			this.renderPage('channel', [
				['slug', channel_slug],
			])
		})

		/* last wildcard, used as a 404 catch all (no next)) */
		page('*', (ctx,) => {
			console.log('404 ?')
		})
	}
	handleFirstUrl() {
		page(window.location)
	}

	/* build the app's dom elements */
	buildAppMenu() {
		/* the menu */
		const $menu = document.createElement('r4-menu')
		$menu.setAttribute('origin', this.origin)
		$menu.setAttribute('pathname', this.pathname)
		$menu.setAttribute('direction', 'row')
		$menu.innerHTML = `
			<a href="./">
				<r4-title small="true"></r4-title>
			</a>
			<a href="explore">Explore</a>
			<r4-auth-status>
				<span slot="in">
					<r4-user-channels-select></r4-user-channels-select> <a href="r4-sign-out">sign out</a>
				</span>
				<span slot="out">
					sign-{<a href="${this.appUrl}/">in</a>, <a href="r4-sign-up">up</a>}
				</span>
			</r4-auth-status>
		`
		return $menu
	}

	/* render the original content of the slots */
	renderSlots() {
		const $menu = this.buildAppMenu()
		$menu.querySelector('r4-user-channels-select').addEventListener('input', this.onChannelSelect.bind(this))
		this.$slotHeader.append($menu)

		const $player = document.createElement('r4-player')
		this.$slotPlayer.append($player)
	}

	/* each time URL changes and needs to render a page */
	renderPage(pageName, attributes) {
		this.$slotMain.innerHTML = ''
		const $page = document.createElement(`r4-page-${pageName}`)
		if (attributes) {
			attributes.forEach(attribute => {
				$page.setAttribute(attribute[0], attribute[1])
			})
		}
		this.$slotMain.append($page)
		console.log('render page:', pageName, this.$slotMain, attributes)
	}
	/* events */
	onChannelSelect({detail, target}) {
		if (detail.channel) {
			const { slug } = detail.channel
			page(slug)
		}
	}
}
