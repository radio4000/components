import {LitElement, html} from 'lit'

export default class R4PageHome extends LitElement {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}

	render() {
		const {href} = this.config
		const {user, userChannels, followings} = this.store
		return html`
			<h1>Radio4000 Beta</h1>

			<menu>
				<li>
					<a href=${href + '/explore'}>Explore</a>
				</li>
				${user ? html`<li><a href=${href + '/settings'}>Settings</a></li>` : null}
				<li>
					<a href=${href + '/sign/' + (user ? 'out' : 'in')}>Sign ${user ? 'out' : 'in'}</a>
					${!user ? html`/ <a href=${href + '/sign/up'}>up</a>` : null}
				</li>
			</menu>

			<main>
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
				${followings?.length
					? html`
							<section>
								<h2>Following</h2>
								<ul list>
									${followings?.map((channel) => this.renderChannelCard(channel, href))}
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
