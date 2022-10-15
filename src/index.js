import { Component } from 'wchooks'
import { render } from 'lit'

import R4Title from './components/r4-title.js'
import R4Favicon from './components/r4-favicon.js'
import R4SignUp from './components/r4-sign-up'
import R4SignIn from './components/r4-sign-in'
import R4SignOut from './components/r4-sign-out'

customElements.define('r4-title', R4Title)
customElements.define('r4-favicon', R4Favicon)
customElements.define('r4-sign-up', Component(R4SignUp, render))
customElements.define('r4-sign-in', Component(R4SignIn, render))
customElements.define('r4-sign-out', Component(R4SignOut, render))


export default {
	R4Title,
	R4Favicon,
	R4SignUp,
	R4SignIn,
	R4SignOut
}
