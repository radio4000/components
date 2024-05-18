import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'

/**
 * Give it a channel slug and it will..
 * render the channel avatar and a form to update as well as delete it
 */
export default class AvatarUpdate extends LitElement {
	static properties = {
		// Decides which channel to update.
		slug: {type: String},
		// The image id from Cloudinary.
		image: {type: String, reflect: true},
	}
	async onUpload({detail}) {
		this.image = detail.public_id
		await sdk.supabase.from('channels').update({image: this.image}).eq('slug', this.slug)
	}
	async onDelete() {
		this.image = null
		const {error} = await sdk.supabase.from('channels').update({image: this.image}).eq('slug', this.slug)
	}
	render() {
		return html` ${this.image ? this.renderAvatar() : this.renderUpload()} `
	}
	renderUpload() {
		return html`<r4-avatar-upload tags=${this.slug} @upload=${this.onUpload}></r4-avatar-upload>`
	}
	renderAvatar() {
		return html`
			<form>
				<fieldset>
					<legend>Image</legend>
					<r4-avatar slug=${this.slug} image=${this.image}></r4-avatar>
				</fieldset>
				<fieldset>${this.renderDelete()}</fieldset>
			</form>
		`
	}
	renderDelete() {
		return html`<button type="button" @click=${this.onDelete} destructive>Delete avatar</button>`
	}

	createRenderRoot() {
		return this
	}
}
