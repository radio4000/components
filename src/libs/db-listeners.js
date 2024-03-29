import {sdk} from './sdk.js'

// This class listens to different events from the database and dispatches new ones.
// Pass it an instance of `r4-app` and call .start() to start listening
export default class DatabaseListeners extends EventTarget {
	constructor(r4App) {
		super()
		this.r4App = r4App
		sdk.supabase.auth.onAuthStateChange(this.onAuthChange.bind(this))
	}

	onAuthChange(eventType, session) {
		this.dispatchEvent(new CustomEvent('auth', {detail: {eventType, user: session?.user}}))
		if (eventType === 'SIGNED_OUT') this.stop()
	}

	async start() {
		// Always cleanup existing listeners.
		await this.stop()

		const user = this.r4App.user
		if (user) {
			sdk.supabase
				.channel('user-channels-events')
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'user_channel',
						filter: `user_id=eq.${user.id}`,
					},
					(payload) => {
						this.dispatchEvent(new CustomEvent('user-channels', {detail: payload}))
					}
				)
				.subscribe()

			sdk.supabase
				.channel('yser-account')
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'accounts',
						filter: `id=eq.${user.id}`,
					},
					(payload) => {
						this.dispatchEvent(new CustomEvent('user-account', {detail: payload}))
					}
				)
				.subscribe()
		}

		const channelId = this.r4App.selectedChannel?.id
		if (channelId) {
			sdk.supabase
				.channel('followers')
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'followers',
						filter: `follower_id=eq.${channelId}`,
					},
					(payload) => {
						this.dispatchEvent(new CustomEvent('followers', {detail: payload}))
					}
				)
				.subscribe()
		}
	}

	stop() {
		return sdk.supabase.removeAllChannels()
	}
}
