import { LitElement, html } from 'lit'
import sdk from '@radio4000/sdk'

/**
 * Give it a channel slug and it will..
 * render the channel avatar and a form to update as well as delete it
 */
export default class AvatarUpdate extends LitElement {
	static properties = {
		// Decides which channel to update.
		slug: { type: String },
		// The image id from Cloudinary.
		image: { type: String, state: true },
	}
	async onUpload({ detail }) {
		this.image = detail.public_id
		await sdk.supabase.from('channels').update({ image: this.image }).eq('slug', this.slug)
	}
	async onDelete() {
		this.image = null
		const { error } = await sdk.supabase.from('channels').update({ image: this.image }).eq('slug', this.slug)
		if (error) console.log(error)
	}
	render() {
		return html`
			<div>
				<r4-avatar slug=${this.slug} image=${this.image}></r4-avatar>
				<r4-avatar-upload tags=${this.slug} @upload=${this.onUpload}></r4-avatar-upload>
				<br>
				<p><button type="button" @click=${this.onDelete}>Delete avatar</button></p>
			</div>
		`
	}

	createRenderRoot() {
		return this
	}
}
