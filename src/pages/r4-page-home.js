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
			.order('updated_at', {ascending: true})
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
						<a href="#channels">Channel${userChannels?.length > 1 ? 's' : ''}</a>
					</h2>
				</header>
				<r4-list> ${userChannels.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}

	renderSignIn() {
		return html`
			<p><a href="${this.config.href}/sign/in">Sign in</a> to create, import or manage a radio 4000 channel.</p>
			${this.latestTracks?.length ? this.renderTracks() : nothing}
			${this.featuredChannels?.length ? this.renderFeaturedChannels() : nothing}
		`
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
								<r4-button-play .track=${track}></r4-button-play>
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
			<section id="network">
				<header>
					<h2><a href="#network">Network</a></h2>
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
				<dialog open inline>
					<p>
						Welcome to the new <strong><r4-title></r4-title></strong>, version 2 (<strong>v2</strong>).
					</p>
					<p>
						To import a radio channel from v1 to v2, see
						<a href="${this.config.hrefMigrate}">migrate</a>.
					</p>
					<p>
						All previous radio channels are still available on the
						<a href="${this.config.hrefV1}">v1</a> website.
					</p>
					<p>Feedbacks and bug reports always welcome!</p>
				</dialog>
			</section>
		`
	}
}
