import { html } from 'lit'
import sdk from '@radio4000/sdk'

const R4SignOut = () => {
	return html`
		<button type="button" @click=${() => sdk.signOut()}>Sign Out</button>
	`
}

export default R4SignOut
