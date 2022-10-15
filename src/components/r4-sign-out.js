import { html } from 'lit'
import { signOut } from '@radio4000/sdk'

const R4SignOut = () => {
	return html`
		<button type="button" @click=${() => signOut()}>Sign Out</button>
	`
}

export default R4SignOut
