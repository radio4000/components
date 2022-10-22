import sdk from '@radio4000/sdk'
const template = document.createElement('template')
template.innerHTML = `
	<r4-actions>
		<option value="">Track actions</option>
		<option value="play">Play</option>
		<option value="share">Share</option>
	</r4-actions>
`

export default class R4TrackActions extends HTMLElement {
	get id() {
		return this.getAttribute('id')
	}
	set id(str) {
		if (str) {
			this.setAttribute('id', str)
		} else {
			this.removeAttribute('id')
		}
	}

	constructor() {
		super()
		/* keydown to fix "space" as key to open the select */
		this.addEventListener('click', this.onPush.bind(this))
		this.addEventListener('keydown', this.onPush.bind(this))
	}

	connectedCallback() {
		this.append(template.content.cloneNode(true))
	}

	/* when the select is slected (open) the first time,
	 lazy load some options */
	async onPush(event) {
		/* fix select accessibility */
		if (event.type === 'keydown') {
			if (event.keyCode !== 32) {
				return
			}
		}

		if (this.id && !this.track) {
			const { error, data } = await sdk.findTrack(this.id)
			if (error) {
				this.renderAsyncOptions({
					value: 'track',
					text: `track id: track error`
				})
			} else if (data && !this.canEdit) {
				this.track = data
				this.canEdit = await sdk.canEditTrack(this.id)
				if (this.canEdit) {
					this.renderAsyncOptions({
						value: 'update',
						text: `update`
					})
					this.renderAsyncOptions({
						value: 'delete',
						text: `delete`
					})
				}
			}
		}
	}
	render() {
		this.innerHTML = ''
		if (!this.tracks) {
			this.renderNoTracks()
		} else {
			this.renderTracks()
		}
	}
	renderAsyncOptions({value, text}) {
		const $actions = this.querySelector('r4-actions select')

		const $asyncOption = document.createElement('option')
		$asyncOption.value = value
		$asyncOption.innerText = text

		$actions.append($asyncOption)
	}
}
