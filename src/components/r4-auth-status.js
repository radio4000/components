import sdk from '@radio4000/sdk'

/* Authentication Status for the current signed in user;
	 this componet has two slots, to render something when signed in or out;
	 otherwise it renders nothing, but the "auth" attribute,
	 can be used to display a feedback to the user.
*/

/* user is "signed in" and "signed out" slots */
const template = document.createElement('template')
template.innerHTML = `
	<slot name="in" hidden="true"></slot>
	<slot name="out" hidden="true"></slot>
`

export default class R4AuthStatus extends HTMLElement {
	static get observedAttributes() {
		return ['auth']
	}
	get auth() {
		return this.getAttribute('auth') === 'true'
	}
	set auth(bool) {
		bool ? this.setAttribute('auth', bool) : this.removeAttribute('auth')
	}
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
		this.shadowRoot.append(template.content.cloneNode(true))
		this.$in = this.shadowRoot.querySelector('[name="in"]')
		this.$out = this.shadowRoot.querySelector('[name="out"]')
	}

	attributeChangedCallback(attrName) {
		if (R4AuthStatus.observedAttributes.indexOf(attrName) > -1) {
			this.renderTemplate()
		}
	}

	async connectedCallback() {
		const {
			data: { user },
		} = await sdk.supabase.auth.getUser()
		this.auth = !!user
	}

	renderTemplate() {
		/* if signed in (authed), show in, hide out */
		if (this.auth) {
			this.$in.removeAttribute('hidden')
			this.$out.setAttribute('hidden', true)
		} else {
			this.$in.setAttribute('hidden', true)
			this.$out.removeAttribute('hidden')
		}
	}
}
