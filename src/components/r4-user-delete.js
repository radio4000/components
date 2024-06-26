import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'

/**
 * Renders a <form> to delete the user account, channels and tracks.
 * You can either pass it the user + userChannels, OR it will fetch them again.
 */
export default class R4UserDelete extends LitElement {
	static get properties() {
		return {
			user: {type: Object},
			userChannels: {type: Array},
		}
	}

	async connectedCallback() {
		super.connectedCallback()
		if (!this.user) this.user = (await sdk.users.readUser()).data
		if (this.user && !this.userChannels) this.userChannels = (await sdk.channels.readUserChannels()).data
	}

	async onSubmit(event) {
		event.preventDefault()

		if (!window.confirm('Do you really want to delete your account, channels and tracks?')) return

		for (const channel of this.userChannels) {
			await sdk.channels.deleteChannel(channel.id)
		}

		const {error} = await sdk.users.deleteUser()
		if (!error) {
			console.info('Successfully deleted user account, channels and tracks')
			// After deleting, we need to sign out and clear local auth state.
			await sdk.auth.signOut()
			for (const key of Object.keys(localStorage)) {
				const isSupabaseAuthToken = key.startsWith('sb-') && key.endsWith('-auth-token')
				if (isSupabaseAuthToken) localStorage.removeItem(key)
			}
		} else {
			console.error('Error deleting user account', error)
		}
	}

	render() {
		if (!this.user) return
		return html`
			<details>
				<summary>Delete your account?</summary>
				<form @submit=${this.onSubmit}>
					<p>I confirm that:</p>
					<p>
						<label>
							<input type="checkbox" name="deleteUser" required />
							My user account ${this.user.email} will be deleted
						</label>
					</p>
					${this.userChannels?.length ? this.userChannels.map((c) => this.renderChannelCheckbox(c)) : null}
					<button type="submit" destructive>Delete my account</button>
				</form>
			</details>
		`
	}

	renderChannelCheckbox(c) {
		return html`
			<p>
				<label>
					<input type="checkbox" name=${`deleteChannel_${c.slug}`} required />
					<a href=${this.href + '/' + c.slug}>
						<r4-channel-slug> ${c.slug} </r4-channel-slug>
					</a>
					and all its tracks will be lost</label
				>
			</p>
		`
	}

	createRenderRoot() {
		return this
	}
}
