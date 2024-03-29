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
		image: {type: String, state: true},
	}
	async onUpload({detail}) {
		this.image = detail.public_id
		await sdk.supabase.from('channels').update({image: this.image}).eq('slug', this.slug)
	}
	async onDelete() {
		this.image = null
		const {error} = await sdk.supabase.from('channels').update({image: this.image}).eq('slug', this.slug)
		if (error) console.log(error)
	}
	render() {
		return html`
			${this.image ? this.renderAvatar() : null} ${!this.image ? this.renderUpload() : null}
			${this.image ? this.renderDelete() : null}
		`
	}
	renderAvatar() {
		return html`<r4-avatar slug=${this.slug} image=${this.image} size="small"></r4-avatar>`
	}
	renderUpload() {
		return html`<r4-avatar-upload tags=${this.slug} @upload=${this.onUpload}></r4-avatar-upload>`
	}
	renderDelete() {
		return html`<button type="button" @click=${this.onDelete} destructive>Delete avatar</button>`
	}

	createRenderRoot() {
		return this
	}
}
