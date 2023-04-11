import { LitElement, html } from 'lit'

function R4ChannelCard(channel) {
	return html`<article class="Card">
		<h3><a href=${`/${channel.slug}`}>${channel.name}</a></h3>
		<p>${channel.description}</p>
	</article>`
}

export default class R4PageHome extends LitElement {
	static properties = {
		config: { type: Object, state: true },
		store: { type: Object, state: true },
	}

	get hasOneChannel() {
		if (!this.store.user) return false
		return this.store?.userChannels?.length === 1 ? true : false
	}

	render() {
		return html`
			<header>
				<h1><r4-title></r4-title></h1>
			</header>
			<main>
				<menu>
					<li>
						<a href="${this.config.href}/explore">Explore channels</a> to discover new content
					</li>
				</menu>

				<section>
					${this.store?.userChannels?.length ? html`
						<section class="Grid">
							${this.store?.userChannels.map(R4ChannelCard)}
						</section>
					` : null}
				</section>
			</main>
		`
	}
	createRenderRoot() {
		return this
	}
}
