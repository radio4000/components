import sdk from '@radio4000/sdk'

export default class R4User extends HTMLElement {
	connectedCallback() {
		this.render()
	}
	async render() {
		const user = await sdk.getUser()
		this.setAttribute('user-id', user.id)
		if (user.email) this.textContent = user.email
	}
}
