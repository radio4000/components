import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'
import {UI_STATES} from '../libs/appearance.js'

/**
 * Main layout component with player states and fullscreen support
 */
export default class R4Layout extends LitElement {
	static properties = {
		isPlaying: {type: Boolean, attribute: 'is-playing', reflect: true},
		isTop: {type: Boolean},
		uiState: {type: String, attribute: 'ui-state', reflect: true},
		uiStates: {type: Object},
    // JS-controlled open/close in place of <details>
    isPlaybackOpen: {type: Boolean},
	}

	playerRef = createRef()

	constructor() {
		super()
		this.uiStates = UI_STATES
		this.uiState = this.uiStates.Dock
		this.isPlaybackOpen = true
		document.addEventListener('fullscreenchange', this.onFullscreen.bind(this))
	}

	disconnectedCallback() {
		document.removeEventListener('fullscreenchange', this.onFullscreen)
	}

	willUpdate(changedProps) {
		changedProps.has('isPlaying') && this.onIsPlaying()
		changedProps.has('uiState') && this.onUiState()
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

		// ensure player section is visible when not closed
		if (this.uiState !== this.uiStates.Close) {
			this.isPlaybackOpen = true
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
			this.isPlaybackOpen = false
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
		// reveal player area when controls are used
		this.isPlaybackOpen = true
	}

	onTogglePlayback = (event) => {
		// Prevent toggling when clicking interactive controls inside
		const path = event.composedPath?.() || []
		const clickedButton = path.find((el) => el?.tagName === 'BUTTON' && el?.getAttribute('name'))
		if (clickedButton) return
		this.isPlaybackOpen = !this.isPlaybackOpen
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
			<div part="playback-details" ?open=${this.isPlaybackOpen}>
				<div part="playback-summary">
					<button part="playback-toggle" @click=${this.onTogglePlayback} aria-expanded=${this.isPlaybackOpen} aria-controls="r4-playback-panel">
						${this.isPlaying ? this.renderPlaybackIcon() : null}
					</button>
					<slot name="playback-controls" @submit=${this.onControlSubmit}>
						${Object.entries(this.uiStates).map(this.renderUiState.bind(this))}
					</slot>
				</div>
				${this.isPlaybackOpen ? html`<div id="r4-playback-panel" part="playback-panel"><slot name="player"></slot></div>` : null}
			</div>
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
