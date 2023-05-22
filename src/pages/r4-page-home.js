import { LitElement, html } from 'lit'

export default class R4PageHome extends LitElement {
	static properties = {
		config: { type: Object, state: true },
		store: { type: Object, state: true },
	}

	render() {
		const { href } = this.config
		const { user, userChannels } = this.store
		return html`
			<menu>
				<li>
					<a href=${href + '/explore'}>Explore</a>
				</li>
				<li>
					<a href=${href + '/sign/' + (user ? 'out' : 'in')}>Sign ${user ? 'out' : 'in'}</a>
					${!user ? html`/ <a href=${this.config.href + '/sign/up'}>up</a>` : null}
				</li>
			</menu>

			<main>
				${this.store.user ? this.renderMenuUser() : null}
				${this.store?.userChannels?.length
					? html`
							<section>
								<h2>Your channel${this.store?.userChannels?.length > 1 ? 's' : ''}</h2>
								<ul>
									${this.store?.userChannels.map((channel) => this.renderChannelCard(channel, href))}
								</ul>
							</section>
					  `
					: null}
				${this.store?.userChannels?.length
					? html`
							<section>
								<h2>Your channel follows</h2>
								<ul>
									${this.store?.followings?.map((channel) => this.renderChannelCard(channel, href))}
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
