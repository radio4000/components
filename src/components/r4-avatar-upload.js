import { LitElement, html } from 'lit'

/**
 * Renders a form to upload an image to Cloudinary.
 * Supports uploading multiple images (but it is disabled)
 * When the image is uploaded, it triggers an "upload" event with the Cloudinary response.
 */
export default class R4AvatarUpload extends LitElement {
	static properties = {
		loading: { type: Boolean, state: true },
	}

	async handleSubmit(event) {
		event.preventDefault()

		const files = event.target.file.files
		for (const file of files) {
			this.loading = true

			const formData = new FormData()
			formData.append('upload_preset', 'tc44ivjo')
			formData.append('file', file)

			fetch(`https://api.cloudinary.com/v1_1/radio4000/auto/upload`, {
				method: 'POST',
				body: formData,
			})
				.then((response) => response.json())
				.then((data) => {
					const uploadEvent = new CustomEvent('upload', {
						bubbles: true,
						detail: data,
					})
					this.dispatchEvent(uploadEvent)
					this.loading = false
				})
				.catch((err) => {
					console.log('error uploading', err)
				})
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
}
