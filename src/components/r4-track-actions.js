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
	static get observedAttributes() {
		return ['id']
	}
	get id() {
		return this.getAttribute('id')
	}
	constructor() {
		super()
		this.append(template.content.cloneNode(true))
		this.addEventListener('click', this.onSelect.bind(this))
	}

	async onSelect() {
		if (!this.user) {
			this.user = await sdk.getUser()
			this.renderAsyncOptions({
				value: 'user',
				text: `user id: ${this.user.id}`
			})
		}
		if (this.id && !this.track) {
			const { error, data } = await sdk.findTrack(this.id)
			if (error) {
				this.renderAsyncOptions({
					value: 'track',
					text: `track id: track error`
				})
			} else if (data) {
				this.track = data
				this.renderAsyncOptions({
					value: 'track',
					text: `track id: ${this.track.id}`
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
	renderAsyncOptions({value, text}) {
		const $actions = this.querySelector('r4-actions select')

		const $asyncOption = document.createElement('option')
		$asyncOption.value = value
		$asyncOption.innerText = text

		$actions.append($asyncOption)
	}
}
