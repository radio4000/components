const template = document.createElement('template')
template.innerHTML = `
	<form>
		<fieldset>
			<label for="channel_url" id="channel_url">Channel URL
				<input readonly name="channel_url" type="url"/>
			</label>
		</fieldset>
		<fieldset>
			<label for="channel_iframe" id="channel_iframe">Channel Iframe</label>
			<input readonly name="channel_iframe" type="url"/>
		</fieldset>
		<fieldset>
			<label for="channel_icon" id="channel_icon">Channel Icon</label>
			<input readonly name="channel_icon" type="url"/>
		</fieldset>
	</form>
`

export default class R4ChannelSharer extends HTMLElement {
	static get observedAttributes() {
		return ['slug', 'origin', 'api-origin', 'icon-origin']
	}

	/* some attributes, that can be used to fetch model data,
	 and are unique to the channel */
	get slug() {
		return this.getAttribute('slug')
	}


	/* Used to make a link to the channel's homepage.
		 It could point to different URL schemes:
		 - on root: https://radio.example.org/
		 - on subpage: https://music.example.org/test-radio-2
		 - in query parameter: https://example.org/?radio=test-radio-4
		 To handle all case, we replace the `{{slug}}` token in the string
	 */
	get origin() {
		const url = this.getAttribute('origin')
		if (typeof url === 'string') {
			if (this.slug) {
				return url.replace('{{slug}}', this.slug)
			}
		}
		return url
	}

	/* the link to the r4 api */
	get apiOrigin() {
		return this.getAttribute('api-origin') || 'https://api.radio4000.com'
	}

	/* the link to the image icon src on the r4 assets domain */
	get iconOrigin() {
		return this.getAttribute('icon-origin') || 'https://assets.radio4000.com/icon-r4.svg'
	}

	/* generated HTML markup for an embedable iframe */
	get iframe() {
		return `<iframe src="${this.apiOrigin}/embed?slug=${this.slug}" width="320" height="500" frameborder="0"></iframe>`
	}

	/* generated HTML icon img + anchor, for and embedable link to channel */
	get icon() {
		return `<a href="${this.origin}"><img width="30" src="${this.iconOrigin}" title="${this.slug}@r4" alt="${this.slug}@r4"></a>`
	}


	attributeChangedCallback(attrName) {
		console.log('changed', attrName, this.slug)
		if (this.constructor.observedAttributes.indexOf(attrName) > -1) {
			this.render()
		}
	}

	async connectedCallback() {
		if (this.slug) {
			this.render()
		}
	}

	render() {
		this.innerHTML = ''
		const $dom = this.buildTemplate()
		this.append($dom)
		this.querySelectorAll('input').forEach($input => {
			$input.addEventListener('click', this.onInputClick.bind(this))
		})
	}

	disconnectedCallback() {
		this.querySelectorAll('input').forEach($input => {
			$input.removeEventListener('click', this.onInputClick)
		})
	}

	buildTemplate() {
		const $sharer = template.content.cloneNode(true)
		$sharer.querySelector('[name="channel_url"]').value = this.origin
		$sharer.querySelector('[name="channel_iframe"]').value = this.iframe
		$sharer.querySelector('[name="channel_icon"]').value = this.icon
		return $sharer
	}
	onInputClick({target}) {
		target && target.select()
	}
}
