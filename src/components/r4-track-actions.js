import {sdk} from '@radio4000/sdk'
const template = document.createElement('template')
template.innerHTML = `
	<r4-actions>
		<option value="">...</option>
		<option value="play">Play</option>
	</r4-actions>
`
// <option value="share">Share</option>

export default class R4TrackActions extends HTMLElement {
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
		if (event.type === 'keydown' && event.keyCode !== 32) return

		// without an id we can't do anything
		if (!this.id) return

		/* if can't edit, try checking if can */
		if (!this.canEdit) {
			this.canEdit = await sdk.tracks.canEditTrack(this.id)
		}

		if (this.didRenderAsync) return

		console.log(this.id, this.canEdit)

		/* if can edit, render option for editors */
		if (this.canEdit) {
			this.renderAsyncOption({
				value: 'update',
				text: 'Update',
			})
			this.renderAsyncOption({
				value: 'delete',
				text: 'Delete',
			})
			this.didRenderAsync = true
		}

		// if no track yet, fetch it
		if (this.id && !this.track) {
			const {error, data} = await sdk.tracks.readTrack(this.id)
			if (error) {
				this.renderAsyncOption({
					value: 'track',
					text: `track id: track error`,
				})
			} else if (data && !this.canEdit) {
				this.canEdit = await sdk.tracks.canEditTrack(this.id)
				this.track = data
			}
		}
	}

	renderAsyncOption({value, text}) {
		const $actions = this.querySelector('r4-actions select')
		const $asyncOption = document.createElement('option')
		$asyncOption.value = value
		$asyncOption.innerText = text
		$actions.append($asyncOption)
	}
}
