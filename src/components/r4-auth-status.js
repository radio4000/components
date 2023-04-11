import {LitElement, html} from 'lit'

/* Authentication Status for the current signed in user;
	 this componet has two slots, to render something when signed in or out;
	 otherwise it renders nothing, but the "auth" attribute,
	 can be used to display a feedback to the user.
*/

export default class R4AuthStatus extends LitElement {
	static properties = {
		auth: {type: Boolean, reflect: true},
	}

	static shadowRootOptions = { ...LitElement.shadowRootOptions, mode: 'open' }

	render() {
		// console.log('auth', this.auth)
		return html`
			<slot name="in" ?hidden=${!this.auth}></slot>
			<slot name="out" ?hidden=${this.auth}></slot>
		`
	}
}
