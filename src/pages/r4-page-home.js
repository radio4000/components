import {html, nothing} from 'lit'
import R4Page from '../components/r4-page.js'
import {sdk} from '../libs/sdk.js'

export default class R4PageHome extends R4Page {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
		featuredChannels: {type: Array, state: true},
		latestTracks: {type: Array, state: true},
	}

	async connectedCallback() {
		super.connectedCallback()

		const {data: channels} = await sdk.supabase
			.from('channels')
			.select()
			.limit(10)
			.order('updated_at', {ascending: false})
		this.featuredChannels = channels

		const {data: tracks} = await sdk.supabase
			.from('channel_tracks')
			.select()
			.limit(10)
			.order('created_at', {ascending: false})

		this.latestTracks = tracks
	}

	renderHeader() {
		if (!this.store.userChannels?.length) {
			return html`<a href=${this.config.href}><r4-favicon></r4-favicon></a>`
		} else {
			return html`
				<menu>
					<li>
						<h1>
							<a href=${this.config.href}>Dashboard</a>
						</h1>
					</li>
				</menu>
			`
		}
	}

	renderMain() {
		return html`
			${this.store.userChannels?.length ? this.renderUserChannels() : this.renderBetaNote()}
			${this.store.following?.length ? this.renderFollowingChannels() : nothing}
			${this.store.user ? nothing : this.renderSignIn()}
		`
	}

	renderUserChannels() {
		const {userChannels} = this.store
		return html`
			<section id="channels">
				<header>
					<h2>
						<a href="#channels">My Channel${userChannels?.length > 1 ? 's' : ''}</a>
					</h2>
				</header>
				<r4-list> ${userChannels.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}

	renderSignIn() {
		return html`
			<p>
				<a href="${this.config.href}/sign/in">Sign in</a> or <a href="${this.config.href}/sign/up">sign up</a> for a new
				(v2) account.
			</p>
			<p><a href="${this.config.href}/explore">Explore</a> radio channels.</p>
		`
		// return html`
		// 	${this.featuredChannels?.length ? this.renderFeaturedChannels() : nothing}
		// 	${this.latestTracks?.length ? this.renderTracks() : nothing}
		// `
	}

	renderTracks() {
		return html`
			<section>
				<header>
					<h2>Lastest tracks</h2>
				</header>
				<p>
					${this.latestTracks?.map(
						(track) =>
							html`<span>
								<r4-button-play slug=${track.slug} .track=${track}></r4-button-play>
								<small> ${track.title} (from @${track.slug}) </small>
							</span>`,
					)}
				</p>
			</section>
		`
	}

	renderFeaturedChannels() {
		return html`
			<section>
				<header>
					<h2>Recent radios</h2>
				</header>
				<r4-list>
					${this.featuredChannels.map((channel) => this.renderChannelCard(channel, this.config.href))}
				</r4-list>
			</section>
		`
	}

	renderFollowingChannels() {
		const {following} = this.store
		return html`
			<section id="following">
				<header>
					<h2><a href="#following">Following</a></h2>
				</header>
				<r4-list> ${following?.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}

	renderChannelCard(channel, origin) {
		return html` <r4-list-item>
			<r4-channel-card .channel=${channel} origin="${origin}/${channel.slug}"></r4-channel-card>
		</r4-list-item>`
	}

	renderBetaNote() {
		return html`
			<section>
				<header>
					<p>
						<center>Welcome to <r4-title></r4-title> <strong>version 2</strong> (v2).</center>
					</p>
				</header>
				<details>
					<summary>Joining from version 1?</summary>
					<dialog open inline>
						<p>
							<center>
								<strong> Can't find an existing Radio? </strong>
							</center>
						</p>
						<menu>
							<li>
								<a href="${this.config.hrefMigrate}">Import a radio from version 1</a> (previous website,
								<a href="${this.config.hrefV1}" target="_blank">v1</a>).
							</li>
						</menu>
						<p>Need help? Have feedback? Found a bug? Want to contribute?</p>
						<p>
							<center><a href="${this.config.href}/settings#about">Get in touch</a>!</center>
						</p>
					</dialog>
				</details>
			</section>
		`
	}
}
