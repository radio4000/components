import { LitElement, html } from 'lit'

/**
 * Renders a form to upload an image to Cloudinary.
 * Supports uploading multiple images (but it is disabled)
 * When the image is uploaded, it triggers an "upload" event with the Cloudinary response.
 */
export default class R4AvatarUpload extends LitElement {
	static properties = {
		tags: { type: String, reflective: true },
		loading: { type: Boolean, state: true },
	}

	async handleSubmit(event) {
		event.preventDefault()

		const files = event.target.file.files
		for (const file of files) {
			this.loading = true

			const res = await createImage(file, this.tags)
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
				<input type="file" name="file" />
				<button type="submit" ?disabled=${this.loading}>Upload image</button>
			</form>
		`
	}

	createRenderRoot() {
		return this
	}
}

// @todo move to sdk.channels.createImage()
async function createImage(file, tags) {
	const formData = new FormData()
	formData.append('upload_preset', 'tc44ivjo')
	formData.append('file', file)
	if (tags) formData.append('tags', tags)

	return fetch(`https://api.cloudinary.com/v1_1/radio4000/auto/upload`, {
		method: 'POST',
		body: formData,
	})
}
