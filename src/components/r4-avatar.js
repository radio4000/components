import { LitElement, html } from 'lit'
import {sdk} from '@radio4000/sdk'

/**
 * Renders an image in a predefined format for channel avatars.
 * There are two ways to tell the component what to render
 * 1. Pass in an `image` with the Cloudinary image id
 * 2. Pass in a `slug` with the channel slug. This will cause a network request to happen
 */
export default class R4Avatar extends LitElement {
	static properties = {
		image: { type: String },
		slug: { type: String, reflect: true },
	}

	async connectedCallback() {
		super.connectedCallback()
		if (this.slug) {
			const { data } = await sdk.channels.readChannel(this.slug)
			this.image = data.image
		}
	}

	render() {
		return ResponsiveCloudinaryImage(this.image)
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}

// Renders a responsive image loaded from Cloudinary.
function ResponsiveCloudinaryImage(id) {
	if (!id) return null

	const baseUrl = 'https://res.cloudinary.com/radio4000/image/upload'
	const small = 'w_250,h_250'
	const large = 'w_500,h_500'
	const crop = 'c_thumb,q_60'
	// const imageUrl = `${baseUrl}/${image}`

	return html`
		<figure>
			<picture>
				<source
					type="image/webp"
					srcset=${`${baseUrl}/${small},${crop},fl_awebp/${id}.webp 1x, ${baseUrl}/${large},${crop},fl_awebp/${id}.webp 2x`}
				/>
				<source
					media="(max-width: 500px)"
					srcset=${`${baseUrl}/${small},${crop}/${id}.jpg 1x, ${baseUrl}/${large},${crop}/${id}.jpg 2x`}
				/>
				<source
					srcset=${`${baseUrl}/${small},${crop},fl_lossy/${id} 1x, ${baseUrl}/${large},${crop},fl_lossy/${id} 2x`}
				/>
				<img src=${`${baseUrl}/${small},${crop},fl_lossy/${id}`} alt=${`Avatar for ${id}`} />
			</picture>
		</figure>
	`
}
