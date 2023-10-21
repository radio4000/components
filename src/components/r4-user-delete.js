import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

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
		const {error} = await sdk.users.deleteUser()
		if (!error) {
			console.info('Successfully deleted user account, channels and tracks')
			// no-need to logout the user, already done by supabase
		} else {
			console.log('Error deleting user account', error)
		}
	}

	render() {
		if (!this.user) return
		return html`
			<form @submit=${this.onSubmit}>
				<details>
					<summary>Delete your account?</summary>
					<p>I confirm that:</p>
					<p>
						<label>
							<input type="checkbox" name="deleteUser" required />
							My user account ${this.user.email} will be deleted
						</label>
					</p>
					${this.userChannels?.length ? this.userChannels.map((c) => this.renderChannelCheckbox(c)) : null}
					<button type="submit" destructive>Delete my account</button>
				</details>
			</form>
		`
	}

	renderChannelCheckbox(c) {
		return html`
			<p>
				<label>
					<input type="checkbox" name=${`deleteChannel_${c.slug}`} required />
					<a href=${this.href + '/' + c.slug}>${c.slug}</a> and all its tracks will be lost</label
				>
			</p>
		`
	}

	createRenderRoot() {
		return this
	}
}
