import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

/**
 * Renders a form to upload an image to Cloudinary.
 * Supports uploading multiple images (but it is disabled)
 * When the image is uploaded, it triggers an "upload" event with the Cloudinary response.
 */
export default class R4AvatarUpload extends LitElement {
	static properties = {
		tags: {type: String, reflective: true},
		loading: {type: Boolean, state: true},
	}

	async handleSubmit(event) {
		event.preventDefault()

		const files = event.target.file.files
		for (const file of files) {
			this.loading = true

			const res = await sdk.channels.createImage(file, this.tags)
			const data = await res.json()

			const uploadEvent = new CustomEvent('upload', {
				bubbles: true,
				detail: data,
			})
			this.dispatchEvent(uploadEvent)
			this.loading = false
		}
	}
	render() {
		return html`
			<form method="post" enctype="multipart/form-data" @submit=${this.handleSubmit}>
				<fieldset>
					<label for="file">Avatar</label>
					<input type="file" name="file" required />
				</fieldset>
				<fieldset>
					<button type="submit" ?disabled=${this.loading}>Upload avatar</button>
				</fieldset>
			</form>
		`
	}

	createRenderRoot() {
		return this
	}
}
