import {LitElement, html} from 'lit'

export default class R4TrackActions extends LitElement {
	static get properties() {
		return {
			canEdit: {type: Boolean},
			error: {type: Object},
		}
	}

	handleInput(event) {
		this.dispatchEvent(
			new CustomEvent('input', {
				bubbles: true,
				detail: event.target.value,
			})
		)

		this.querySelector('option').selected = true
	}

	render() {
		return html`
			<select @input=${this.handleInput}>
				<option>…</option>
				${this.canEdit ? this.renderAdmin() : null} ${this.renderCommon()}
			</select>
		`
	}
	renderAdmin() {
		return html`
			<option value="update">Update</option>
			<option value="delete">Delete</option>
		`
	}
	renderCommon() {
		return html` <option value="share">Share</option> `
	}

	createRenderRoot() {
		return this
	}
}
