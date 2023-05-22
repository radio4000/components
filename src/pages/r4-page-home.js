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
			<header>${!this.store.user ? html`<h1>Welcome to <r4-title></r4-title>!</h1>` : null}</header>
			<menu>
				<li>
					<a href=${href + '/explore'}>Explore</a>
				</li>
				<li>
					<r4-auth-status ?auth=${user}>
						<span slot="in">
							<a href=${`${href}/settings`}>Settings</a>
						</span>
						<span slot="out">
							<a href=${href + '/sign/up'}>Create new radio</a>
						</span>
					</r4-auth-status>
				</li>
				<li>
					<r4-auth-status ?auth=${user}>
						<span slot="in">
							<a href=${href + '/sign/out'}>Sign out</a>
						</span>
						<span slot="out">
							<a href=${href + '/sign/in'}>Sign in</a>
						</span>
					</r4-auth-status>
				</li>
			</menu>

			<main>
				${this.store.user ? this.renderMenuUser() : this.renderMenuNoUser()}
				${this.store?.userChannels?.length
					? html`
							<section>
								<h2>Your channel:</h2>
								<ul>
									${this.store?.userChannels.map((channel) => this.renderChannelCard(channel, href))}
								</ul>
							</section>
					  `
					: null}
				${this.store?.userChannels?.length
					? html`
							<section>
								<h2>Your channel follows:</h2>
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

	renderMenuNoUser() {
		return html`
			<menu>
				<li><a href="${this.config.href}/explore">Explore channels</a> to discover new content</li>
				<li><a href=${this.config.href + '/sign/up'}>Sign up</a> to start your own radio</li>
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
