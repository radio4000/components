import {LitElement, html} from 'lit'

export default class R4PageHome extends LitElement {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}

	render() {
		const {href} = this.config
		const {user, userChannels, following} = this.store
		return html`
			<header>
				<h1>Radio4000 beta</h1>
			</header>
			<main>
				<p>
					This is page is the public beta for a new Radio4000 (<a href=${href + `/about`}>learn more</a>). Try it out!
				</p>
				<p>
					<strong>WARNING &rarr;</strong> all data created on the beta website will be deleted regularely. Keep adding
					your music on the regular application!
				</p>
				${user ? this.renderMenuUser() : null}
				${userChannels?.length
					? html`
							<section>
								<h2>Your channel${userChannels?.length > 1 ? 's' : ''}</h2>
								<ul list>
									${userChannels.map((channel) => this.renderChannelCard(channel, href))}
								</ul>
							</section>
					  `
					: null}
				${following?.length
					? html`
							<section>
								<h2>Following</h2>
								<ul list>
									${following?.map((channel) => this.renderChannelCard(channel, href))}
								</ul>
							</section>
					  `
					: null}
			</main>
		`
	}

	renderChannelCard(channel) {
		const channelOrigin = `${this.config.href}/${channel.slug}`
		return html` <li>
			<r4-channel-card .channel=${channel} origin=${channelOrigin}></r4-channel-card>
		</li>`
	}

	renderMenuUser() {
		return html``
	}

	createRenderRoot() {
		return this
	}
}
