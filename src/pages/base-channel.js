import {html} from 'lit'
import {sdk} from '../libs/sdk.js'
import R4Page from '../components/r4-page.js'

export default class BaseChannel extends R4Page {
	static properties = {
		channel: {type: Object, state: true},
		channelError: {type: Object, state: true},
		canEdit: {type: Boolean, state: true},
		alreadyFollowing: {type: Boolean, state: true},
		followsYou: {type: Boolean, state: true},
		isFirebaseChannel: {type: Boolean, state: true},
		// from router
		params: {type: Object, state: true},
		store: {type: Object, state: true},
		config: {type: Object, state: true},
		searchParams: {type: Object, state: true},
	}

	async connectedCallback() {
		if (!this.channel) await this.setChannel()
		super.connectedCallback()
	}

	get slug() {
		return this.config.singleChannel ? this.config.selectedSlug : this.params.slug
	}

	get channelOrigin() {
		return this.config.singleChannel ? this.config.href : `${this.config.href}/${this.params.slug}`
	}

	get tracksOrigin() {
		const {singleChannel, href} = this.config
		return singleChannel ? `${href}/tracks/` : `${href}/${this.params.slug}/tracks/`
	}

	get coordinates() {
		if (this.channel.longitude && this.channel.latitude) {
			return {
				longitude: this.channel.longitude,
				latitude: this.channel.latitude,
			}
		}
		return undefined
	}

	get hasOneChannel() {
		if (!this.store.user) return false
		return this.store?.userChannels?.length === 1 ? true : false
	}

	get alreadyFollowing() {
		if (!this.store.user) return false
		return this.store.following?.map((c) => c.slug).includes(this.channel?.slug)
	}

	get followsYou() {
		if (!this.store.user) return false
		return this.store.followers?.map((c) => c.slug).includes(this.config.selectedSlug)
	}

	// Set channel from the config or URL params.
	async setChannel() {
		const slug = this.config.singleChannel && this.config.selectedSlug ? this.config.selectedSlug : this.params.slug

		// No need to set again if channel the same channel is loaded.
		if (this.channel?.slug === slug) return

		const {data, error} = await sdk.channels.readChannel(slug)
		this.canEdit = await sdk.channels.canEditChannel(slug)

		if (error) {
			try {
				const res = await fetch('https://radio4000.firebaseio.com/channels.json?orderBy="slug"&equalTo="' + slug + '"')
				const list = await res.json()
				this.isFirebaseChannel = list[Object.keys(list)[0]]
			} catch (e) {
				//
			}
			if (!this.isFirebaseChannel) {
				this.channelError = error
			}
		} else {
			this.isFirebaseChannel = false
			this.channel = data
		}
	}

	createRenderRoot() {
		return this
	}

	renderAside() {
		return html`${this.channel ? this.renderChannelShare() : null}`
	}

	renderHeader() {
		if (this.isFirebaseChannel) {
			return html`
				<dialog open inline>
					<p>
						This Radio4000 channel is from <a href="https://v1.radio4000.com/${this.params.slug}">version 1</a>. If you
						are the channel operator, consider importing it to
						<a href="${this.config.hrefMigrate}/?slug=${this.params.slug}">version 2</a>.
					</p>
					<form method="dialog">
						<button>Got it!</button>
					</form>
				</dialog>
			`
		}
		if (this.channelError) {
			return this.renderChannelError()
		}
		if (this.channel) {
			return [this.renderChannelCard(), this.renderChannelMenu()]
		}
	}
	renderChannelShare() {
		return html`
			<r4-dialog name="share" @close="${this.onDialogClose}">
				<r4-share slot="dialog" origin="${this.channelOrigin}" slug="${this.channel.slug}"></r4-share>
			</r4-dialog>
		`
	}
	renderChannelError() {
		return html`<p>404. There is no channel here. Want to <a href="${this.config.href}/new">create one?</a></p>`
	}
	renderChannelCard() {
		return html` <r4-channel-card .channel=${this.channel} origin=${this.channelOrigin}></r4-channel-card> `
	}
	renderChannelMenu() {
		return html`
			<menu>
				<li>
					<a href="${this.channelOrigin + '/tracks'}">Tracks</a>
				</li>
				<li hidden="true">
					<a href="${this.channelOrigin + '/feed'}">Feed</a>
				</li>
				<li>
					<a href="${this.channelOrigin + '/following'}">Following</a>
				</li>
				<li>
					<a href="${this.channelOrigin + '/followers'}">Followers</a>
				</li>
				${this.coordinates && !this.config.singleChannel ? this.renderCoordinates() : null}
				<li>
					<button type="button" role="menuitem" @click=${() => this.openDialog('share')}>Share</button>
				</li>
				<li>${this.renderSocial()}</li>
				${this.canEdit ? [this.renderAddTrack(), this.renderEdit()] : null}
			</menu>
		`
	}
	renderCoordinates() {
		return html`<li><r4-channel-coordinates>${this.renderMap()}</r4-channel-coordinates></li>`
	}
	renderAddTrack() {
		return html`
			<li>
				<a href="${this.config.href}/add?slug=${this.channel.slug}"> Add </a>
			</li>
		`
	}
	renderEdit() {
		return html`
			<li>
				<a href="${this.channelOrigin}/update"> Update </a>
			</li>
		`
	}
	renderSocial() {
		if (!this.config?.singleChannel && this.store.user) {
			return html`
				<r4-channel-social>
					<r4-button-follow
						?following=${this.alreadyFollowing}
						.channel=${this.channel}
						.userChannel=${this.store.selectedChannel}
					></r4-button-follow>
				</r4-channel-social>
			`
		}
	}
	renderChannelImage(image) {
		if (!image) return null
		return html` <r4-avatar image=${image} size="small"></r4-avatar> `
	}

	renderTrackItem(track) {
		return html`
			<r4-list-item>
				<r4-track
					.track=${track}
					.channel=${this.channel}
					.canEdit=${this.canEdit}
					.config=${this.config}
					href=${this.config.href}
					origin=${this.tracksOrigin}
					?playing=${this.config.playingTrack?.id === track.id}
				></r4-track>
			</r4-list-item>
		`
	}

	renderMap() {
		const mapUrl = `${this.config.href}/map/?longitude=${this.coordinates.longitude}&latitude=${this.coordinates.latitude}&slug=${this.channel.slug}`
		return html`<a href=${mapUrl}><r4-icon name="map_position"></r4-icon></a>`
	}

	onDialogClose({target}) {
		const name = target.getAttribute('name')
		if (name === 'track') {
			if (this.config.singleChannel) {
				page('/track')
			} else {
				page(`/${this.params.slug}/tracks`)
			}
		}
	}

	openDialog(name) {
		const $dialog = this.querySelector(`r4-page-aside r4-dialog[name="${name}"]`)
		if ($dialog) {
			$dialog.setAttribute('visible', true)
		}
	}

	closeDialog(name) {
		const $dialog = this.querySelector(`r4-dialog[name="${name}"]`)
		if ($dialog) {
			$dialog.removeAttribute('visible')
		}
	}
}
