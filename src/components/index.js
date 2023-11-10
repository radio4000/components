/**
 * Here we import (and re-export) all components, and register all custom elements.
 * except for R4Components, which is only used for the demo page.
 */

import R4Actions from './r4-actions.js'
import R4App from './r4-app.js'
import R4BaseQuery from './r4-base-query.js'
import R4AppMenu from './r4-app-menu.js'
import R4Avatar from './r4-avatar.js'
import R4AvatarUpdate from './r4-avatar-update.js'
import R4AvatarUpload from './r4-avatar-upload.js'
import R4AuthStatus from './r4-auth-status.js'
import R4ButtonPlay from './r4-button-play.js'
import R4ButtonFollow from './r4-button-follow.js'
import R4Channel from './r4-channel.js'
import R4ChannelCard from './r4-channel-card.js'
import R4ChannelCreate from './r4-channel-create.js'
import R4ChannelDelete from './r4-channel-delete.js'
import R4ChannelUpdate from './r4-channel-update.js'
import R4Dialog from './r4-dialog.js'
import R4EmailUpdate from './r4-email-update.js'
import R4Favicon from './r4-favicon.js'
import R4Layout from './r4-layout.js'
import R4Map from './r4-map.js'
import R4MapPosition from './r4-map-position.js'
import R4Player from './r4-player.js'
import R4PasswordUpdate from './r4-password-update.js'
import R4PasswordReset from './r4-password-reset.js'
import R4Router from './r4-router.js'
import {R4ChannelSearch, R4TrackSearch} from './r4-search.js'
import R4Share from './r4-share.js'
import R4SignIn from './r4-sign-in.js'
import R4SignOut from './r4-sign-out.js'
import R4SignUp from './r4-sign-up.js'
import R4SupabaseQuery from './r4-supabase-query.js'
import R4SupabaseFilters from './r4-supabase-filters.js'
import R4SupabaseFilterSearch from './r4-supabase-filter-search.js'
import R4Title from './r4-title.js'
import R4Track from './r4-track.js'
import R4TrackCreate from './r4-track-create.js'
import R4TrackDelete from './r4-track-delete.js'
import R4TrackUpdate from './r4-track-update.js'
import R4Tuner from './r4-tuner.js'
import R4User from './r4-user.js'
import R4UserAccount from './r4-user-account.js'
import R4UserDelete from './r4-user-delete.js'
import R4UserChannelsSelect from './r4-user-channels-select.js'
import R4Pagination from './r4-pagination.js'
import R4Icon from './r4-icon.js'

customElements.define('r4-actions', R4Actions)
customElements.define('r4-app', R4App)
customElements.define('r4-app-menu', R4AppMenu)
customElements.define('r4-avatar', R4Avatar)
customElements.define('r4-avatar-update', R4AvatarUpdate)
customElements.define('r4-avatar-upload', R4AvatarUpload)
customElements.define('r4-auth-status', R4AuthStatus)
customElements.define('r4-base-query', R4BaseQuery)
customElements.define('r4-button-play', R4ButtonPlay)
customElements.define('r4-button-follow', R4ButtonFollow)
customElements.define('r4-channel', R4Channel)
customElements.define('r4-channel-card', R4ChannelCard)
customElements.define('r4-channel-create', R4ChannelCreate)
customElements.define('r4-channel-delete', R4ChannelDelete)
customElements.define('r4-channel-update', R4ChannelUpdate)
customElements.define('r4-channel-search', R4ChannelSearch)
customElements.define('r4-dialog', R4Dialog)
customElements.define('r4-email-update', R4EmailUpdate)
customElements.define('r4-favicon', R4Favicon)
customElements.define('r4-layout', R4Layout)
customElements.define('r4-map', R4Map)
customElements.define('r4-map-position', R4MapPosition)
customElements.define('r4-password-update', R4PasswordUpdate)
customElements.define('r4-password-reset', R4PasswordReset)
customElements.define('r4-player', R4Player)
customElements.define('r4-router', R4Router)
customElements.define('r4-share', R4Share)
customElements.define('r4-sign-in', R4SignIn)
customElements.define('r4-sign-out', R4SignOut)
customElements.define('r4-sign-up', R4SignUp)
customElements.define('r4-supabase-query', R4SupabaseQuery)
customElements.define('r4-supabase-filters', R4SupabaseFilters)
customElements.define('r4-supabase-filter-search', R4SupabaseFilterSearch)
customElements.define('r4-title', R4Title)
customElements.define('r4-track', R4Track)
customElements.define('r4-track-create', R4TrackCreate)
customElements.define('r4-track-delete', R4TrackDelete)
customElements.define('r4-track-update', R4TrackUpdate)
customElements.define('r4-track-search', R4TrackSearch)
customElements.define('r4-tuner', R4Tuner)
customElements.define('r4-user', R4User)
customElements.define('r4-user-delete', R4UserDelete)
customElements.define('r4-user-account', R4UserAccount)
customElements.define('r4-user-channels-select', R4UserChannelsSelect)
customElements.define('r4-pagination', R4Pagination)
customElements.define('r4-icon', R4Icon)

export default {
	R4Actions,
	R4App,
	R4AppMenu,
	R4Avatar,
	R4AvatarUpdate,
	R4AvatarUpload,
	R4AuthStatus,
	R4BaseQuery,
	R4ButtonPlay,
	R4ButtonFollow,
	R4Channel,
	R4ChannelCard,
	R4ChannelCreate,
	R4ChannelDelete,
	R4ChannelUpdate,
	R4ChannelSearch,
	R4Dialog,
	R4EmailUpdate,
	R4Favicon,
	R4Layout,
	R4Player,
	R4Map,
	R4MapPosition,
	R4PasswordReset,
	R4PasswordUpdate,
	R4Router,
	R4SignIn,
	R4SignOut,
	R4SignUp,
	R4Share,
	R4SupabaseQuery,
	R4SupabaseFilters,
	R4SupabaseFilterSearch,
	R4Title,
	R4Track,
	R4TrackCreate,
	R4TrackDelete,
	R4TrackUpdate,
	R4TrackSearch,
	R4Tuner,
	R4User,
	R4UserAccount,
	R4UserDelete,
	R4UserChannelsSelect,
	R4Pagination,
	R4Icon,
}
