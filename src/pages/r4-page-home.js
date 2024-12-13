import {html, nothing} from 'lit'
import R4Page from '../components/r4-page.js'
import {sdk} from '../libs/sdk.js'

export default class R4PageHome extends R4Page {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
		featuredChannels: {type: Array, state: true},
	}

	async connectedCallback() {
		super.connectedCallback()

		const {data: channels} = await sdk.supabase
			.from('channels')
			.select()
			.not('firebase_id', 'is', null)
			.order('updated_at', {ascending: false})
			.limit(10)

		this.featuredChannels = channels
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
			${this.store.userChannels?.length ? this.renderUserChannels() : this.renderNewChannel()}
			${this.store.following?.length ? this.renderFollowingChannels() : nothing}
			${this.store.user && this.featuredChannels ? nothing : this.renderFeaturedChannels()}
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

	renderFeaturedChannels() {
		return html`
			<section>
				<r4-list>
					${this.featuredChannels?.map((channel) => this.renderChannelCard(channel, this.config.href))}
				</r4-list>
				<p><a href="${this.config.href}/explore">Explore</a> all channels.</p>
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

	renderNewChannel() {
		return html`
			<section>
				<header>
					<p>
						<center>Welcome to <r4-title></r4-title> <strong>version 2</strong> (v2).</center>
					</p>
				</header>
				<menu>
					<li><a href="${this.config.href}/new">New radio channel</a></li>
				</menu>
			</section>
		`
	}
}
