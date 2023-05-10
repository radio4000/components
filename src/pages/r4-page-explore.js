import {html, LitElement} from 'lit'

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
				<h1>Explore</h1>
				<p>All <r4-title ></r4-title> channels.</p>
				<p>View the <a href=${`${this.config.href}/map`}>R4 Map</a>.</p>
			</header>
			<section>
				<r4-channels
					@r4-list=${this.onNavigateList}
					origin=${this.channelOrigin}
					pagination="true"
					limit=${this.query.limit || 6}
					page=${this.query.page || 1}
				></r4-channels>
			</section>
		`
	}
	createRenderRoot() {
		return this
	}

	onNavigateList({detail}) {
		/* `page` here, is usually globaly the "router", beware */
		const {page: currentPage, limit, list} = detail
		const newPageURL = new URL(window.location)

		limit && newPageURL.searchParams.set('limit', limit)
		currentPage && newPageURL.searchParams.set('page', currentPage)

		if (window.location.href !== newPageURL.href) {
			history.replaceState({}, window.title, newPageURL.href)
		}
	}
}
