import { html, LitElement } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'
import styles from '../styles/components/r4-layout.js'

export default class R4Layout extends LitElement {
	static styles = [...styles]

	static properties = {
		isPlaying: {type: Boolean, attribute: 'is-playing', reflect: true},
		uiState: {type: String, attribute: 'ui-state', reflect: true},
		uiStates: {type: Object},
	}

	playerRef = createRef()

	constructor() {
		super()
		this.uiStates = {
			Close: 'close',
			Dock: 'dock',
			Minimize: 'minimize',
			Fullscreen: 'fullscreen',
		}
		this.uiState = this.uiStates.Close
		document.addEventListener('fullscreenchange', this.onFullscreen.bind(this))
	}

	disconnectedCallback() {
		document.removeEventListener('fullscreenchange', this.onFullscreen)
	}

	willUpdate(changedProperties) {
		if (changedProperties.has('isPlaying')) {
			if (!this.isPlaying) {
				this.uiState = this.uiStates.Close
			}

			if (this.isPlaying && this.uiState === this.uiStates[0]) {
				this.uiState = this.uiStates.Dock
			}
		}

		if (changedProperties.has('uiState')) {
			if (this.isPlaying) {

			}
			this.onUiState()
		}
	}

	onUiState() {
		console.log('onUistate changed', this.uiState)
		const previousUiState = 'test'

		// handle fullscreen in/out
		if (this.uiState === this.uiStates.Fullscreen) {
			this.playerRef.value.requestFullscreen()
		} else if (window.fullscreen) {
			window.exitFullscreen()
		}

		console.log(this.uiState, this.uiStates.Close, this.isPlaying)
		// first time you close, it hides player
		if (this.uiState === this.uiStates.Close) {
			const stopPlayEvent = new CustomEvent('r4-play', {
				bubbles: true,
				detail: null
			})
			this.dispatchEvent(stopPlayEvent)

			// second time, it stops the playback
			if (previousUiState === 'close') {

				/* this.isPlaying = false */
				/* this.removeAttribute('tracks') */
				/* console.log('stopPlayEvent', stopPlayEvent) */
			}
		}
	}

	onFullscreen(event) {
		if (!document.fullscreenElement) {
			this.uiState = this.uiStates.Dock
		}
	}

	render() {
		return html`
			<r4-layout-header>
				<slot name="header"></slot>
			</r4-layout-header>
			<r4-layout-main>
				<slot name="main"></slot>
			</r4-layout-main>
			<r4-layout-playback ${ref(this.playerRef)}>
				<r4-layout-controls>
					<slot name="controls">
						${this.renderControls()}
					</slot>
				</r4-layout-controls>
				<slot name="player"></slot>
			</r4-layout-playback>
		`
	}

	renderControls() {
		if (!this.isPlaying) return
		return html`
			<menu>
				${Object.entries(this.uiStates).map(this.renderUiState.bind(this))}
			</menu>
		`
	}

	renderUiState(uiState) {
		const [value, name] = uiState
		return html`
			<li>
				<button
					@click=${this.onControlClick}
					value=${value}
				>
					${name}
				</button>
			</li>
		`
	}

	onControlClick({
		target: {
			value: uiStateNext
		}
	}) {
		this.uiState = this.uiStates[uiStateNext]
	}
}
