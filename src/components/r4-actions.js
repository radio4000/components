import {LitElement, html} from 'lit'

/**
 * A dropdown menu that
 * closes on ESC
 * only has one open at a time
 */
export default class R4Actions extends LitElement {
	// static properties = {}

	connectedCallback() {
		this.addEventListener('keydown', this.onKey)
		const details = this.querySelector('details')
		details && details.addEventListener('toggle', this.onToggle.bind(this))
	}

	onKey(event) {
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

	close(details) {
		details.removeAttribute('open')
		const summary = details.querySelector('summary')
		if (summary) summary.focus()
		this.closeCurrentMenu(details)
	}

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

	// render() {
	// 	return html`
	// 		<details>
	// 			<summary>⏷</summary>
	//
	// 			<menu>
	// 				<li><button>One</button></li>
	// 				<li><a href="#">One</a></li>
	// 			</menu>
	// 		</details>
	// 	`
	// }

	createRenderRoot() {
		return this
	}
}

