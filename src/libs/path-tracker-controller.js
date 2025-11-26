import {requestState} from './router-controller.js'

/**
 * Reactive controller for tracking current path in menu components.
 * Synchronizes with router state and location changes.
 */
export class PathTrackerController {
	constructor(host) {
		this.host = host
		this._onLocationChange = (event) => {
			const rel = event.detail?.path
			if (rel) {
				this.host.path = rel
			}
		}
		host.addController(this)
	}

	hostConnected() {
		window.addEventListener('r4:location-changed', this._onLocationChange)
		const state = requestState()
		if (state?.path) {
			this.host.path = state.path
		}
	}

	hostDisconnected() {
		window.removeEventListener('r4:location-changed', this._onLocationChange)
	}

	hostUpdated(changedProperties) {
		if (changedProperties.has('href') && this.host.href) {
			const state = requestState()
			if (state?.path) {
				this.host.path = state.path
			} else {
				try {
					const basePath = new URL(this.host.href).pathname
					const current = window.location.pathname
					const rel = current.startsWith(basePath) ? current.slice(basePath.length) || '/' : current
					this.host.path = rel.startsWith('/') ? rel : '/' + rel
				} catch {
					this.host.path = window.location.pathname || '/'
				}
			}
		}
	}
}
