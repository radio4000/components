import sdk from '@radio4000/sdk'

export default class R4SignOut extends HTMLElement {
	connectedCallback() {
		this.addEventListener('click', async (event) => {
			event.preventDefault()
			const submitEvent = new CustomEvent('submit', {
				bubbles: true,
				detail: await sdk.signOut()
			})
			this.dispatchEvent(submitEvent)
		})
		this.innerHTML = `<button type="button">Sign Out</button>`
	}
}
