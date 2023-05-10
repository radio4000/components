import { LitElement, html } from 'lit'

export default class R4PageHome extends LitElement {
	static properties = {
		config: { type: Object, state: true },
		store: { type: Object, state: true },
	}

	render() {
		return html`
			<header>
				${!this.store.user ? html`Welcome to <r4-title></r4-title>!` : null}
			</header>
			<main>
				${this.store.user ? this.renderMenuUser() : this.renderMenuNoUser()}
				${this.store?.userChannels?.length ? html`
					<section>
						<h2>You channel:</h2>
						${this.store?.userChannels.map((channel) => this.renderChannelCard(channel, this.config.href))}
					</section>
				` : null}
				${this.store?.userChannels?.length ? html`
					<section>
						<h2>Your channel follows:</h2>
						${this.store?.followings?.map(({channel_id: channel}) => this.renderChannelCard(channel, this.config.href))}
					</section>
		` : null}
			</main>
		`
	}

	renderChannelCard(channel) {
		const channelOrigin = `${this.config.href}/${channel.slug}`
		return html`<r4-channel-card .channel=${channel} origin=${channelOrigin}></r4-channel-card>`
	}

	renderMenuNoUser() {
		return html`
			<menu>
				<li>
					<a href="${this.config.href}/explore">Explore channels</a> to discover new content
				</li>
			</menu>
		`
	}

	renderMenuUser() {
		return html``
	}

	createRenderRoot() {
		return this
	}
}
