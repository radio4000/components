import {html} from 'lit'
import {until} from 'lit/directives/until.js'
import BaseChannel from './base-channel'
import page from 'page/page.mjs'

export default class R4PageChannelFollowings extends BaseChannel {
	render() {
		return html`${until(
			Promise.resolve(this.channel)
				.then((channel) => {
					return channel ? this.renderPage(channel) : this.renderNoPage()
				})
				.catch(() => this.renderNoPage()),
			this.renderLoading()
		)}`
	}

	renderPage(channel) {
		const channelOrigin = this.buildChannelHref(channel)
		return html`
			<header>
				<code>@</code>
				<a href=${channelOrigin}>${channel.slug}</a>
				<code>/</code>
				<a href=${channelOrigin + '/followings'}>followings</a>
			</header>
			<main>
				<r4-channel-followings
					channel-id=${channel.id}
					origin=${channelOrigin}
					limit=${this.query.limit || 10}
					page=${this.query.page || 1}
					pagination="true"
					@r4-list=${this.onNavigateList}
				></r4-channel-followings>
			</main>
		`
	}
	renderNoPage() {
		return html`404 - No channel with this slug`
	}
	renderLoading() {
		return html`<span>Loading channel followings...</span>`
	}

	/* no shadow dom */
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
			page.redirect(newPageURL.pathname + newPageURL.search)
		}
	}
}
