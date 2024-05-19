/**
 * Here we import (and re-export) all components, and register all custom elements.
 * Except for R4Components, which is only used and imported on the demo/examples/ page.
 */
import R4Actions from './r4-actions.js'
import R4Admin from './r4-admin.js'
import R4App from './r4-app.js'
import R4AppMenu from './r4-app-menu.js'
import R4AppUserMenu from './r4-app-user-menu.js'
import R4CommandMenu from './r4-command-menu.js'
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
import R4DiscogsResource from './r4-discogs-resource.js'
import R4EmailUpdate from './r4-email-update.js'
import R4Favicon from './r4-favicon.js'
import R4Layout from './r4-layout.js'
import R4Loading from './r4-loading.js'
import R4Map from './r4-map.js'
import R4MapPosition from './r4-map-position.js'
import R4Player from './r4-player.js'
import R4PasswordUpdate from './r4-password-update.js'
import R4PasswordReset from './r4-password-reset.js'
import R4Query from './r4-query.js'
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

const componentDefinitions = {
	'r4-actions': R4Actions,
	'r4-admin': R4Admin,
	'r4-app': R4App,
	'r4-command-menu': R4CommandMenu,
	'r4-app-menu': R4AppMenu,
	'r4-app-user-menu': R4AppUserMenu,
	'r4-avatar': R4Avatar,
	'r4-avatar-update': R4AvatarUpdate,
	'r4-avatar-upload': R4AvatarUpload,
	'r4-auth-status': R4AuthStatus,
	'r4-button-play': R4ButtonPlay,
	'r4-button-follow': R4ButtonFollow,
	'r4-channel': R4Channel,
	'r4-channel-card': R4ChannelCard,
	'r4-channel-create': R4ChannelCreate,
	'r4-channel-delete': R4ChannelDelete,
	'r4-channel-update': R4ChannelUpdate,
	'r4-channel-search': R4ChannelSearch,
	'r4-dialog': R4Dialog,
	'r4-discogs-resource': R4DiscogsResource,
	'r4-email-update': R4EmailUpdate,
	'r4-favicon': R4Favicon,
	'r4-layout': R4Layout,
	'r4-loading': R4Loading,
	'r4-map': R4Map,
	'r4-map-position': R4MapPosition,
	'r4-password-update': R4PasswordUpdate,
	'r4-password-reset': R4PasswordReset,
	'r4-player': R4Player,
	'r4-query': R4Query,
	'r4-router': R4Router,
	'r4-share': R4Share,
	'r4-sign-in': R4SignIn,
	'r4-sign-out': R4SignOut,
	'r4-sign-up': R4SignUp,
	'r4-supabase-query': R4SupabaseQuery,
	'r4-supabase-filters': R4SupabaseFilters,
	'r4-supabase-filter-search': R4SupabaseFilterSearch,
	'r4-title': R4Title,
	'r4-track': R4Track,
	'r4-track-create': R4TrackCreate,
	'r4-track-delete': R4TrackDelete,
	'r4-track-update': R4TrackUpdate,
	'r4-track-search': R4TrackSearch,
	'r4-tuner': R4Tuner,
	'r4-user': R4User,
	'r4-user-delete': R4UserDelete,
	'r4-user-account': R4UserAccount,
	'r4-user-channels-select': R4UserChannelsSelect,
	'r4-pagination': R4Pagination,
	'r4-icon': R4Icon,
}

export default componentDefinitions
