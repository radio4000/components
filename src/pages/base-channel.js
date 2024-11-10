import {html, nothing} from 'lit'
import {sdk} from '../libs/sdk.js'
import R4Page from '../components/r4-page.js'

export default class BaseChannel extends R4Page {
	createRenderRoot() {
		return this
	}

	static properties = {
		channel: {type: Object, state: true},
		channelError: {type: Object, state: true},
		canEdit: {type: Boolean, state: true},
		isFirebaseChannel: {type: Boolean, state: true},
		// from router
		params: {type: Object, state: true},
		store: {type: Object, state: true},
		config: {type: Object, state: true},
		searchParams: {type: Object, state: true},
		// Used to set active link.
		path: {type: Boolean, state: true},
	}

	constructor() {
		super()

		// Set "path" active navigation. Maybe this should be on the router?
		window?.navigation?.addEventListener('navigate', (e) => {
			this.path = e.destination.url.split('?')[0]
		})
		if (!this.path) this.path = window.location.href
	}

	async connectedCallback() {
		if (!this.channel) await this.setChannel()
		super.connectedCallback()
	}

	willUpdate(changedProps) {
		// If the slug changed, check we have the right channel.
		if (changedProps.get('params')?.slug) this.setChannel()
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

	renderAside() {
		return html`${this.channel ? this.renderChannelShare() : null}`
	}

	renderHeader() {
		if (this.isFirebaseChannel) {
			return html`
				<dialog open inline>
					<p>This Radio4000 channel is from <a href="https://v1.radio4000.com/${this.params.slug}">version 1</a>.</p>
					<p>
						If you are the channel operator, consider importing it to
						<a href="${this.config.hrefMigrate}/?slug=${this.params.slug}">version 2</a>. Until then,
						${this.params.slug} is in listen only mode.
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
			return this.renderChannelMenu()
		}
	}

	renderChannelShare() {
		return html`
			<r4-dialog name="share" @close="${this.onDialogClose}">
				<r4-share-channel slot="dialog" origin="${this.channelOrigin}" .channel=${this.channel}></r4-share-channel>
			</r4-dialog>
		`
	}

	renderChannelError() {
		return html`<p>404. There is no channel here. Want to <a href="${this.config.href}/new">create one?</a></p>`
	}

	/** @param {string} path */
	isCurrent(path) {
		return this.path === path ? 'page' : nothing
	}

	renderChannelMenu() {
		const o = this.channelOrigin
		return html`
			<menu>
				<li>
					<h1>
						<a aria-current=${this.isCurrent(o)} href=${o}>
							<r4-channel-slug>${this.channel.slug}</r4-channel-slug>
						</a>
					</h1>
				</li>
				<li>
					<a aria-current=${this.isCurrent(o + '/tracks')} href=${o + '/tracks'}>Tracks</a>
				</li>
				<li hidden="true">
					<a aria-current=${this.isCurrent(o + '/feed')} href=${o + '/feed'}>Feed</a>
				</li>
				<li>
					<a aria-current=${this.isCurrent(o + '/following')} href=${o + '/following'}>Following</a>
				</li>
				<li>
					<a aria-current=${this.isCurrent(o + '/followers')} href=${o + '/followers'}>Followers</a>
				</li>
				${this.coordinates && !this.config.singleChannel ? this.renderCoordinates() : null}
				<li>${this.renderSocial()}</li>
				${this.canEdit ? [this.renderAddTrack(), this.renderEdit()] : null}
			</menu>
		`
	}

	renderCoordinates() {
		const mapUrl = `${this.config.href}/map/?slug=${this.channel.slug}&longitude=${this.coordinates.longitude}&latitude=${this.coordinates.latitude}&zoom=15`
		return html`
			<li>
				<a href=${mapUrl}><r4-icon name="map_position"></r4-icon></a>
			</li>
		`
	}

	renderAddTrack() {
		return html`
			<li>
				<a href="${this.config.href}/add?slug=${this.channel.slug}"> Add track </a>
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
			const isFollower = this.store.following?.map((c) => c.slug).includes(this.channel?.slug)
			return html`
				<r4-channel-social>
					<r4-button-follow
						?following=${isFollower}
						.followerChannel=${this.store.selectedChannel}
						.channel=${this.channel}
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
		// Playing status is disabled because it makes things VERY slow whenever it updates
		// ?playing=${this.config.playingTrack?.id === track.id}
		return html`
			<r4-list-item>
				<r4-track
					.track=${track}
					.channel=${this.channel}
					.canEdit=${this.canEdit}
					.config=${this.config}
					href=${this.config.href}
					origin=${this.tracksOrigin}
				></r4-track>
			</r4-list-item>
		`
	}

	onDialogClose({target}) {
		const name = target.getAttribute('name')
		if (name === 'track') {
			if (this.config.singleChannel) {
				window.page('/track')
			} else {
				window.page(`/${this.params.slug}/tracks`)
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
