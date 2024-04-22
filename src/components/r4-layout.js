import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'
import {UI_STATES} from '../libs/appearance.js'

export default class R4Layout extends LitElement {
	static properties = {
		isPlaying: {type: Boolean, attribute: 'is-playing', reflect: true},
		isTop: {type: Boolean},
		uiState: {type: String, attribute: 'ui-state', reflect: true},
		uiStates: {type: Object},
	}

	playerRef = createRef()
	detailsRef = createRef()

	constructor() {
		super()
		this.uiStates = UI_STATES
		this.uiState = this.uiStates.Minimize
		document.addEventListener('fullscreenchange', this.onFullscreen.bind(this))

		this.topObserver = this.initTopOberserver()
	}

	disconnectedCallback() {
		document.removeEventListener('fullscreenchange', this.onFullscreen)
	}

	willUpdate(changedProps) {
		changedProps.has('isPlaying') && this.onIsPlaying()
		changedProps.has('uiState') && this.onUiState()
	}

	initTopOberserver() {
		/* check if the player at the top of the viewport/screen */
		const observer = new IntersectionObserver(
			([e]) => {
				if (e.intersectionRatio === 1) {
					this.isTop = true
				} else {
					this.isTop = false
				}
			},
			{
				threshold: [1],
			},
		)
		observer.observe(this)
		return observer
	}

	onIsPlaying() {
		if (!this.isPlaying) {
			this.uiState = this.uiStates.Close
		}

		if (this.isPlaying && this.uiState === this.uiStates.Close) {
			this.uiState = this.uiStates.Dock
		}
	}

	onUiState() {
		// handle fullscreen in/out
		if (this.uiState === this.uiStates.Fullscreen) {
			this.playerRef.value.requestFullscreen()
		}
		if (window.fullScreen && this.uiState !== this.uiStates.Fullscreen) {
			document.exitFullscreen()
		}

		if (this.detailsRef.value && this.uiState !== this.uiStates.Close) {
			this.detailsRef.value.setAttribute('open', true)
		}

		// first time you close, it hides player
		if (this.uiState === this.uiStates.Close) {
			if (this.isPlaying) {
				const stopPlayEvent = new CustomEvent('r4-play', {
					bubbles: true,
					detail: null,
				})
				this.dispatchEvent(stopPlayEvent)
				this.isPlaying = false
			}
		}
	}

	onFullscreen() {
		if (!document.fullscreenElement) {
			if (this.uiState === this.uiStates.Fullscreen) {
				this.uiState = this.uiStates.Minimize
			}
		}
	}
	onControlSubmit(event) {
		const {
			currentTarget: {value: stateNonSlotted},
			submitter,
		} = event
		const stateSlot = submitter.getAttribute('value')
		const state = stateSlot || stateNonSlotted
		event.preventDefault()
		this.uiState = this.uiStates[state]
		if (!this.detailsRef?.value?.getAttribute('open')) {
			this.detailsRef?.value?.setAttribute('open', true)
		}
	}
	render() {
		return html`
			<r4-layout-panel part="panel">
				<r4-layout-menu part="menu">
					<slot name="menu"></slot>
				</r4-layout-menu>
				<r4-layout-main part="main">
					<slot name="main"></slot>
				</r4-layout-main>
			</r4-layout-panel>
			<r4-layout-playback ${ref(this.playerRef)} part="playback">
				${this.isPlaying ? this.renderPlayback() : null}
			</r4-layout-playback>
		`
	}

	renderPlayback() {
		return html`
			<details open part="playback-details" ${ref(this.detailsRef)}>
				<summary part="playback-summary">
					${this.isPlaying ? this.renderPlaybackIcon() : null}
					<slot name="playback-controls" @submit=${this.onControlSubmit}>
						${Object.entries(this.uiStates).map(this.renderUiState.bind(this))}
					</slot>
				</summary>
				<slot name="player"></slot>
			</details>
		`
	}
	renderPlaybackIcon() {
		return html`<r4-icon name="player_status" part="playback-status"></r4-icon>`
	}

	renderUiState(uiState) {
		const [value, name] = uiState
		return html`
			<button value=${value} title=${name} name=${name} part="controls-button">
				<r4-icon name="player_${name}"></r4-icon>
			</button>
		`
	}
}
