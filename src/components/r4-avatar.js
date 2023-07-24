import { LitElement, html } from 'lit'
import { sdk } from '@radio4000/sdk'

const SIZES = {
	small: 50,
	medium: 250,
}

/**
 * Renders an image in a predefined format for channel avatars.
 * There are two ways to tell the component what to render
 * 1. Pass in an `image` with the Cloudinary image id
 * 2. Pass in a `slug` with the channel slug. This will cause a network request to happen
 */
export default class R4Avatar extends LitElement {
	static properties = {
		image: {type: String},
		slug: {type: String, reflect: true},
		size: {type: String, reflect: true},
	}

	async connectedCallback() {
		super.connectedCallback()
		if (this.slug) {
			const {data} = await sdk.channels.readChannel(this.slug)
			this.image = data.image
		}
	}

	render() {
		return ResponsiveCloudinaryImage(this.image, this.size)
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}

/**
 * @param {string} id - from cloudinary image
 * @param {string} sizeLabel -
 * @param {string} format -
 */
export function createImage(id, sizeLabel, format = 'webp') {
	const baseUrl = 'https://res.cloudinary.com/radio4000/image/upload'
	const size = SIZES[sizeLabel || 'medium']
	const dimensions = `w_${size},h_${size}`
	const crop = 'c_thumb,q_60'
	return `${baseUrl}/${dimensions},${crop},fl_awebp/${id}.${format}`
}

// Renders a responsive image loaded from Cloudinary.
function ResponsiveCloudinaryImage(id) {
	if (!id) return null
	return html`
		<picture>
			<img src=${createImage(id, 'medium')} alt=${`Avatar for ${id}`} />
		</picture>
	`
}
