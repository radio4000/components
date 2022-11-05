import lib from './lib/index.js'

/* all components */
import R4Title from './components/r4-title.js'
import R4Favicon from './components/r4-favicon.js'
import R4SignUp from './components/r4-sign-up.js'
import R4SignIn from './components/r4-sign-in.js'
import R4SignOut from './components/r4-sign-out.js'
import R4AuthStatus from './components/r4-auth-status.js'
import R4User from './components/r4-user.js'
import R4UserChannelsSelect from './components/r4-user-channels-select.js'

import R4List from './components/r4-list.js'
import R4Channels from './components/r4-channels.js'
import R4Tracks from './components/r4-tracks.js'

import R4Channel from './components/r4-channel.js'
import R4ChannelCreate from './components/r4-channel-create.js'
import R4ChannelUpdate from './components/r4-channel-update.js'
import R4ChannelDelete from './components/r4-channel-delete.js'

import R4Track from './components/r4-track.js'
import R4TrackCreate from './components/r4-track-create.js'
import R4TrackUpdate from './components/r4-track-update.js'
import R4TrackDelete from './components/r4-track-delete.js'

import R4Actions from './components/r4-actions.js'
import R4ChannelActions from './components/r4-channel-actions.js'
import R4TrackActions from './components/r4-track-actions.js'

import R4Layout from './components/r4-layout.js'
import R4Menu from './components/r4-menu.js'
import R4Player from './components/r4-player.js'
import R4Dialog from './components/r4-dialog.js'
import R4ChannelSharer from './components/r4-channel-sharer.js'
import R4Router from './components/r4-router.js'
import R4App from './components/r4-app.js'


customElements.define('r4-title', R4Title)
customElements.define('r4-favicon', R4Favicon)
customElements.define('r4-sign-up', R4SignUp)
customElements.define('r4-sign-in', R4SignIn)

customElements.define('r4-sign-out', R4SignOut)
customElements.define('r4-auth-status', R4AuthStatus)
customElements.define('r4-user', R4User)
customElements.define('r4-list', R4List)
customElements.define('r4-channels', R4Channels)
customElements.define('r4-user-channels-select', R4UserChannelsSelect)
customElements.define('r4-track', R4Track)
customElements.define('r4-channel', R4Channel)
customElements.define('r4-channel-create', R4ChannelCreate)
customElements.define('r4-channel-update', R4ChannelUpdate)
customElements.define('r4-channel-delete', R4ChannelDelete)
customElements.define('r4-track-create', R4TrackCreate)
customElements.define('r4-track-update', R4TrackUpdate)
customElements.define('r4-track-delete', R4TrackDelete)
customElements.define('r4-tracks', R4Tracks)
customElements.define('r4-actions', R4Actions)
customElements.define('r4-channel-actions', R4ChannelActions)
customElements.define('r4-track-actions', R4TrackActions)
customElements.define('r4-layout', R4Layout)
customElements.define('r4-menu', R4Menu)
customElements.define('r4-player', R4Player)
customElements.define('r4-dialog', R4Dialog)
customElements.define('r4-channel-sharer', R4ChannelSharer)
customElements.define('r4-router', R4Router)
customElements.define('r4-app', R4App)

export default {
	lib,

	R4Title,
	R4Favicon,
	R4SignUp,
	R4SignIn,
	R4SignOut,
	R4AuthStatus,
	R4User,
	R4UserChannelsSelect,

	R4List,
	R4Channels,
	R4Tracks,

	R4Channel,
	R4ChannelCreate,
	R4ChannelUpdate,
	R4ChannelDelete,
	R4Track,
	R4TrackCreate,
	R4TrackUpdate,
	R4TrackDelete,

	R4Layout,
	R4Menu,
	R4Player,
	R4Dialog,
	R4ChannelSharer,
	R4Router,
	R4App,

	R4ChannelActions,
	R4TrackActions,
	R4Actions, // export last in list for UX of r4-components
}
