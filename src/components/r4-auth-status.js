import {supabase, readUser} from '@radio4000/sdk'

/* Authentication Status for the current signed in user;
	 this componet has two slots, to render something when signed in or out;
	 otherwise it renders nothing, but the "auth" attribute,
	 can be used to display a feedback to the user.
*/

export default class R4AuthStatus extends HTMLElement {
	static get observedAttributes() {
		return ['auth']
	}
	get auth() {
		return this.getAttribute('auth') === 'true'
	}
	set auth(bool) {
		this.setAttribute('auth', bool)
	}
	attributeChangedCallback(attrName) {
		if (R4AuthStatus.observedAttributes.indexOf(attrName) > -1) {
			this.render()
		}
	}

	constructor() {
		super()
		this.setAttribute('hidden', true)
		supabase.auth.onAuthStateChange(this.onAuthStateChange.bind(this))
		this.attachShadow({ mode: "open" })
	}

	connectedCallback() {
		this.render()
	}

	onAuthStateChange() {
		this.refreshUser()
	}

	async refreshUser() {
		const {data} = await readUser()
		this.auth = !!data
	}

	render() {
		this.shadowRoot.innerHTML = ''
		/* if signed in (authed), show in, hide out */
		const $slot = document.createElement('slot')
		if (this.auth) {
			$slot.setAttribute('name', 'in')
		} else {
			$slot.setAttribute('name', 'out')
		}
		this.shadowRoot.append($slot)
		this.removeAttribute('hidden')
	}
}
