import {html, LitElement} from 'lit'
import {sdk} from '@radio4000/sdk'
import R4Page from '../components/r4-page.js'

// Base class to extend from
export default class BaseChannel extends R4Page {
	static properties = {
		channel: {type: Object, state: true},
		tracks: {type: Array, state: true},
		channelError: {type: Object, state: true},
		canEdit: {type: Boolean, state: true, reflect: true},
		alreadyFollowing: {type: Boolean, state: true, reflect: true},
		followsYou: {type: Boolean, state: true, reflect: true},
		isFirebaseChannel: {type: Boolean},

		// from the router
		params: {type: Object, state: true},
		store: {type: Object, state: true},
		config: {type: Object, state: true},
		searchParams: {type: Object, state: true},
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

	get alreadyFollowing() {
		if (!this.store.user) return false
		return this.store.followings?.map((c) => c.slug).includes(this.channel?.slug)
	}

	get followsYou() {
		if (!this.store.user) return false
		return this.store.followers?.map((c) => c.slug).includes(this.config.selectedSlug)
	}

	get hasOneChannel() {
		if (!this.store.user) return false
		return this.store?.userChannels?.length === 1 ? true : false
	}

	async willUpdate(changedProperties) {
		if (changedProperties.has('params')) {
			await this.setChannel()
		}
	}
	async connectedCallback() {
		super.connectedCallback()
		if (!this.channel) {
			await this.setChannel()
		}
	}

	// Set channel from the slug in the URL.
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
				this.isFirebaseChannel = Object.keys(list).length > 0
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
		return html`<r4-page-aside> ${this.channel ? this.renderChannelShare() : null}</r4-page-aside>`
	}
	renderHeader() {
		if (this.isFirebaseChannel) {
			return html`
				<h1>@${this.params.slug}</h1>
				<p>This channel has not yet migrated to the new Radio4000. That's ok, you can still listen.</p>
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
				<li>
					<a href="${this.channelOrigin + '/feed'}">Feed</a>
				</li>
				<li>
					<a href="${this.channelOrigin + '/following'}">Following</a>
				</li>
				<li>
					<a href="${this.channelOrigin + '/followers'}">Followers</a>
				</li>
				<li>
					<r4-channel-social>${this.renderSocial()}</r4-channel-social>
				</li>

				<li>
					<button @click=${(e) => this.openDialog('share')}>Share</button>
				</li>
				${this.coordinates && !this.config.singleChannel ? this.renderCoordinates() : null}
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
		if (!this.config.singleChannel) {
			return html`
				<button @click=${this.alreadyFollowing ? this.unfollow : this.follow}>
					${this.alreadyFollowing ? 'Unfollow' : 'Follow'}
				</button>
				<span hidden>${this.followsYou ? 'follows you' : "doesn't follow you"}</span>
			`
		}
	}
	renderChannelImage(image) {
		if (!image) return null
		return html` <r4-avatar image=${image} size="small"></r4-avatar> `
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
