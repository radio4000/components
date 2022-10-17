import { Component } from 'wchooks'
import { render } from 'lit'

import R4Title from './components/r4-title.js'
import R4Favicon from './components/r4-favicon.js'
import R4SignUp from './components/r4-sign-up.js'
import R4SignIn from './components/r4-sign-in.js'
import R4SignOut from './components/r4-sign-out.js'
import R4ListChannels from './components/r4-list-channels.js'
import R4ChannelCreate from './components/r4-channel-create.js'

customElements.define('r4-title', R4Title)
customElements.define('r4-favicon', R4Favicon)
customElements.define('r4-sign-up', Component(R4SignUp, render))
customElements.define('r4-sign-in', Component(R4SignIn, render))
customElements.define('r4-sign-out', Component(R4SignOut, render))
customElements.define('r4-list-channels', R4ListChannels)
customElements.define('r4-channel-create', R4ChannelCreate)

export default {
	R4Title,
	R4Favicon,
	R4SignUp,
	R4SignIn,
	R4SignOut,
	R4ListChannels,
	R4ChannelCreate,
}
