import {LitElement, html, nothing} from 'lit'
import {PathTrackerController} from '../libs/path-tracker-controller.js'

/**
 * The primary user menu for <r4-app>
 */
export default class R4AppUserMenu extends LitElement {
	createRenderRoot() {
		return this
	}

	static properties = {
		/* props */
		href: {type: String},
		channel: {type: Object},
		channels: {type: Array},

		/* state */
		path: {type: String, state: true},
	}

	constructor() {
		super()

		this.href = ''
		this.path = ''

		new PathTrackerController(this)

		// Set "path" on every navigation.
		window?.navigation?.addEventListener('navigate', (e) => {
			this.path = e.destination.url.replace(this.href, '').split('?')[0]
		})
	}

	isCurrent(path) {
		return this.path === path ? 'page' : nothing
	}

	onChannelSelect(event) {
		event.stopPropagation()
		event.preventDefault()
		this.dispatchEvent(
			new CustomEvent('select', {
				bubbles: true,
				detail: event.detail,
			}),
		)
	}

	render() {
		const {href} = this
		return html`
			<menu>
				<li>${this.channel ? this.renderAdd() : null}</li>
				<li>${this.renderChannelLinks()}</li>
				${this.channels.length > 1 ? html`<li>${this.renderChannelSelect()}</li>` : null}
				<li><a aria-current=${this.isCurrent('/settings')} href=${href + '/settings'}>Settings</a></li>
			</menu>
		`
	}
	renderChannelLinks() {
		if (this.channel) {
			return html`
				<a aria-current=${this.isCurrent(`/${this.channel.slug}`)} href=${this.href + '/' + this.channel.slug}>
					<r4-channel-slug> ${this.channel.slug} </r4-channel-slug>
				</a>
			`
		} else {
			return html`<a
				aria-current=${this.isCurrent('/new')}
				href=${this.href + '/new'}
				title="Sign in a user account to create a new radio"
			>
				New channel
			</a>`
		}
	}
	renderChannelSelect() {
		if (this.channels) {
			return html`<r4-user-channels-select
				.channels=${this.channels}
				.channel=${this.channel}
				@select=${this.onChannelSelect}
			></r4-user-channels-select>`
		}
	}
	renderAdd() {
		return html`<a aria-current=${this.isCurrent('/add')} href=${this.href + '/add?slug=' + this.channel.slug}
			>Add track</a
		>`
	}
}
