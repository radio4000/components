import {LitElement} from 'lit'

/**
 * A dropdown menu that closes on ESC only has one open at a time
 */
export default class R4Actions extends LitElement {
	// static properties = {}

	connectedCallback() {
		this.addEventListener('keydown', this.onKeyDown)
		const details = this.querySelector('details')
		details && details.addEventListener('toggle', this.onToggle.bind(this))
	}

	/** @param {KeyboardEvent} event */
	onKeyDown(event) {
		if (event.key === 'Escape') {
			const details = this.querySelector('details')
			if (details.hasAttribute('open')) {
				this.close(details)
				event.preventDefault()
				event.stopPropagation()
			}
		}
	}

	onToggle() {
		this.closeCurrentMenu()
	}

	/** @param {HTMLDetailsElement} details */
	close(details) {
		details.removeAttribute('open')
		const summary = details.querySelector('summary')
		if (summary) summary.focus()
		this.closeCurrentMenu(details)
	}

	/** Closes all open r4-action menus on the page */
	closeCurrentMenu() {
		const details = this.querySelector('details')
		if (!details.hasAttribute('open')) return
		for (const menu of document.querySelectorAll('r4-actions details[open] > menu')) {
			const opened = menu.closest('details')
			if (opened && opened !== details && !opened.contains(details)) {
				opened.removeAttribute('open')
			}
		}
	}

	createRenderRoot() {
		return this
	}
}
