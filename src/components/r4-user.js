import sdk from '@radio4000/sdk'

export default class R4User extends HTMLElement {
	static get observedAttributes() {
		return ['user', 'error']
	}

	get user() {
		return JSON.parse(this.getAttribute('user')) || null
	}
	set user(obj) {
		if (obj) {
			this.setAttribute('user', JSON.stringify(obj))
		} else {
			this.removeAttribute('user')
		}
	}

	get error() {
		return JSON.parse(this.getAttribute('error')) || null
	}
	set error(obj) {
		if (obj) {
			this.setAttribute('error', JSON.stringify(obj))
		} else {
			this.removeAttribute('error')
		}
	}

	/* if any observed attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (R4User.observedAttributes.indexOf(attrName) > -1) {
			this.render()
		}
	}

	constructor() {
		super()
		sdk.supabase.auth.onAuthStateChange(this.onAuthStateChange.bind(this))
	}

	connectedCallback() {
		this.refreshUser()
	}
	onAuthStateChange() {
		this.refreshUser()
	}

	async refreshUser() {
		const {
			error,
			data,
		} = await sdk.getUser()
		this.error = error
		this.user = data
	}

	render() {
		this.innerHTML = ''
		if (this.error) {
			/* this.renderError(this.error) */
			this.renderNoUser()
		} else if (!this.user) {
			this.renderNoUser()
		} else {
			this.renderUser(this.user)
		}
	}
	renderError() {}
	renderNoUser() {
		const $noUser = document.createElement('span')
		$noUser.innerText = 'Not signed in'
		this.append($noUser)
	}
	renderUser(user) {
		const $id = document.createElement('input')
		$id.disabled = true
		$id.value = user.id

		const $email = document.createElement('address')
		$email.innerText = user.email

		this.append($id)
		this.append($email)
	}
}
