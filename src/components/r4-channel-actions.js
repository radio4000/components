import {sdk} from '@radio4000/sdk'

const template = document.createElement('template')
template.innerHTML = `
	<r4-actions>
		<option value="">...</option>
		<option value="play">Play</option>
		<option value="tracks">Tracks</option>
		<option value="share">Share</option>
	</r4-actions>
`

export default class R4ChannelActions extends HTMLElement {
	static get observedAttributes() {
		return ['slug']
	}
	get slug() {
		return this.getAttribute('slug')
	}

	get canEdit() {
		return this.hasAttribute('can-edit')
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
		/* events click + keydown (to handle default "space" key, to open the select),
			 and render async options */
		this.addEventListener('click', this.onPush.bind(this))
		this.addEventListener('keydown', this.onPush.bind(this))
	}

	async connectedCallback() {
		this.append(template.content.cloneNode(true))
		// this.canEdit = await canEditChannel(this.slug)
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

		if (!this.slug) return

		/* if can't edit, try checking if can */
		if (!this.canEdit) {
			this.canEdit = await sdk.channels.canEditChannel(this.slug)
		}

		/* if can edit, render option for editors */
		if (this.canEdit && !this.didRenderAsync) {
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
			this.didRenderAsync = true
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
