import sdk from '@radio4000/sdk'
const template = document.createElement('template')
template.innerHTML = `
	<r4-actions>
		<option value="">Channel actions</option>
		<option value="play">Play</option>
		<option value="share">Share</option>
	</r4-actions>
`

export default class R4TrackActions extends HTMLElement {
	static get observedAttributes() {
		return ['slug']
	}
	get slug() {
		return this.getAttribute('slug')
	}

	get canEdit() {
		return this.getAttribute('can-edit') === 'true'
	}

	set canEdit(bool) {
		if (bool) {
			this.setAttribute('can-edit', bool)
		} else {
			this.removeAttribute('can-edit')
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
		/* fix select accessibility "clicking the space bar" */
		if (event.type === 'keydown') {
			if (event.keyCode !== 32) {
				return
			}
		}

		if (!this.slug || this.channel) return

		const { data, error } = await sdk.findChannelBySlug(this.slug)
		if (!data || error) {
			return
		} else {
			this.channel = data
		}

		/* if can't edit, try checking if can */
		if (!this.canEdit) {
			this.canEdit = await sdk.canEditChannel(this.channel.id)

			console.log('can edit', this.canEdit)
			/* if can edit, render option for editors */
			if (this.canEdit) {
				this.renderAsyncOption({
					value: 'create-track',
					text: 'Create track',
				})
				this.renderAsyncOption({
					value: 'update',
					text: 'Update',
				})
				this.renderAsyncOption({
					value: 'delete',
					text: 'Delete',
				})
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
	renderAsyncOption({ value, text }) {
		const $actions = this.querySelector('r4-actions select')

		const $asyncOption = document.createElement('option')
		$asyncOption.value = value
		$asyncOption.innerText = text

		$actions.append($asyncOption)
	}
}
