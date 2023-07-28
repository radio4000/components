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
	}

	render() {
		return html`
			<select @input=${this.handleInput}>
				<option></option>
				${this.canEdit
					? html`
							<option value="update">Update</option>
							<option value="delete">Delete</option>
					  `
					: ''}
			</select>
		`
	}

	createRenderRoot() {
		return this
	}
}
