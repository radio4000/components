/**
 * Here we import (and re-export) all components, and register all custom elements.
 * except for R4Components, which is only used for the demo page.
 */

import R4Actions from './r4-actions.js'
import R4App from './r4-app.js'
import R4Avatar from './r4-avatar.js'
import R4AvatarUpdate from './r4-avatar-update.js'
import R4AvatarUpload from './r4-avatar-upload.js'
import R4AuthStatus from './r4-auth-status.js'
import R4ButtonPlay from './r4-button-play.js'
import R4Channel from './r4-channel.js'
import R4ChannelActions from './r4-channel-actions.js'
import R4ChannelCreate from './r4-channel-create.js'
import R4ChannelDelete from './r4-channel-delete.js'
import R4ChannelSharer from './r4-channel-sharer.js'
import R4ChannelUpdate from './r4-channel-update.js'
import R4Channels from './r4-channels.js'
import R4Dialog from './r4-dialog.js'
import R4Favicon from './r4-favicon.js'
import R4Layout from './r4-layout.js'
import R4List from './r4-list.js'
import R4Map from './r4-map.js'
import R4MapPosition from './r4-map-position.js'
import R4Player from './r4-player.js'
import R4ResetPassword from './r4-reset-password.js'
import R4Router from './r4-router.js'
import R4SignIn from './r4-sign-in.js'
import R4SignOut from './r4-sign-out.js'
import R4SignUp from './r4-sign-up.js'
import R4Title from './r4-title.js'
import R4Track from './r4-track.js'
import R4TrackActions from './r4-track-actions.js'
import R4TrackCreate from './r4-track-create.js'
import R4TrackDelete from './r4-track-delete.js'
import R4TrackUpdate from './r4-track-update.js'
import R4Tracks from './r4-tracks.js'
import R4User from './r4-user.js'
import R4UserChannelsSelect from './r4-user-channels-select.js'

customElements.define('r4-actions', R4Actions)
customElements.define('r4-app', R4App)
customElements.define('r4-avatar', R4Avatar)
customElements.define('r4-avatar-update', R4AvatarUpdate)
customElements.define('r4-avatar-upload', R4AvatarUpload)
customElements.define('r4-auth-status', R4AuthStatus)
customElements.define('r4-button-play', R4ButtonPlay)
customElements.define('r4-channel', R4Channel)
customElements.define('r4-channel-actions', R4ChannelActions)
customElements.define('r4-channel-create', R4ChannelCreate)
customElements.define('r4-channel-delete', R4ChannelDelete)
customElements.define('r4-channel-sharer', R4ChannelSharer)
customElements.define('r4-channel-update', R4ChannelUpdate)
customElements.define('r4-channels', R4Channels)
customElements.define('r4-dialog', R4Dialog)
customElements.define('r4-favicon', R4Favicon)
customElements.define('r4-layout', R4Layout)
customElements.define('r4-list', R4List)
customElements.define('r4-map', R4Map)
customElements.define('r4-map-position', R4MapPosition)
customElements.define('r4-player', R4Player)
customElements.define('r4-reset-password', R4ResetPassword)
customElements.define('r4-router', R4Router)
customElements.define('r4-sign-in', R4SignIn)
customElements.define('r4-sign-out', R4SignOut)
customElements.define('r4-sign-up', R4SignUp)
customElements.define('r4-title', R4Title)
customElements.define('r4-track', R4Track)
customElements.define('r4-track-actions', R4TrackActions)
customElements.define('r4-track-create', R4TrackCreate)
customElements.define('r4-track-delete', R4TrackDelete)
customElements.define('r4-track-update', R4TrackUpdate)
customElements.define('r4-tracks', R4Tracks)
customElements.define('r4-user', R4User)
customElements.define('r4-user-channels-select', R4UserChannelsSelect)

export default {
	R4Actions,
	R4App,
	R4Avatar,
	R4AvatarUpdate,
	R4AvatarUpload,
	R4AuthStatus,
	R4Channel,
	R4ChannelActions,
	R4ChannelCreate,
	R4ChannelDelete,
	R4ChannelSharer,
	R4ChannelUpdate,
	R4Channels,
	R4Dialog,
	R4Favicon,
	R4Layout,
	R4List,
	R4Player,
	R4Map,
	R4MapPosition,
	R4ResetPassword,
	R4Router,
	R4SignIn,
	R4SignOut,
	R4SignUp,
	R4Title,
	R4Track,
	R4TrackActions,
	R4TrackCreate,
	R4TrackDelete,
	R4TrackUpdate,
	R4Tracks,
	R4User,
	R4UserChannelsSelect,
}
