import { html, LitElement } from 'lit'
import page from 'page/page.mjs'

export default class R4PageExplore extends LitElement {
	static properties = {
		/* props */
		config: { type: Object },
		query: { type: Object, state: true },
	}
	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}
	render() {
		return html`
			<header>
				<h1>Explore channels</h1>
				<menu>
					<li><a href=${`${this.config.href}/search`}>search</a></li>
					<li><a href=${`${this.config.href}/map`}>map</a></li>
				</menu>
			</header>
			<main>
				<r4-channels
					@r4-list=${this.onNavigateList}
					origin=${this.channelOrigin}
					pagination="true"
					limit=${this.query.limit || 6}
					page=${this.query.page || 1}
				></r4-channels>
			</main>
		`
	}
	createRenderRoot() {
		return this
	}
	onNavigateList({ detail }) {
		/* `page` here, is usually globaly the "router", beware */
		const { page: currentPage, limit, list } = detail
		const newPageURL = new URL(window.location)

		limit && newPageURL.searchParams.set('limit', limit)
		currentPage && newPageURL.searchParams.set('page', currentPage)

		if (window.location.href !== newPageURL.href) {
			page.redirect(newPageURL.pathname + newPageURL.search)
		}
	}
}
