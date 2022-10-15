import R4Title from './components/r4-title.js'
import R4Favicon from './components/r4-favicon.js'
import {R4SignUp, R4SignIn, R4SignOut} from './components/r4-auth'

customElements.define('r4-title', R4Title)
customElements.define('r4-favicon', R4Favicon)
customElements.define('r4-sign-up', R4SignUp)
customElements.define('r4-sign-in', R4SignIn)
customElements.define('r4-sign-out', R4SignOut)

export default {
	R4Title,
	R4Favicon,
	R4SignUp,
	R4SignIn,
	R4SignOut
}
