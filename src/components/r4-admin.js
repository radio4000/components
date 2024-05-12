import {LitElement, html} from 'lit'
import {createClient} from '@supabase/supabase-js'
import {sdk} from '../libs/sdk'

/**
 *
 * https://supabase.com/docs/reference/javascript/admin-api
 */
export default class R4Admin extends LitElement {
	static properties = {
		supabaseUrl: {type: String},
		supabaseServiceRoleKey: {type: String},
		result: {type: Object},
		users: {type: Array},
		channels: {type: Array},
	}

	async connectedCallback() {
		super.connectedCallback()
		this.createClient()
		await this.prepareData()
	}

	/** Creates a Supabase client with full admin rights */
	createClient() {
		const url = this.supabaseUrl
		const key = this.supabaseServiceRoleKey
		if (!url || !key) return
		// Use `this.supabase.auth.admin` for admin stuff.
		this.supabase = createClient(url, key, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		})
		window.supabaseAdminClient = this.supabase
	}

	/** Sets this.result with all the data we want */
	async prepareData() {
		const {supabase} = this
		const result = {users: [], orphanedChannels: [], orphanedTracks: []}

		// Get users with nested channels.
		// const {data: accounts} = await supabase.from('accounts').select('id')
		// const {data: channels} = await supabase.from('channels').select().limit(4000).order('created_at', {ascending: true})
		// const {data: allChannels} = await sdk.channels.readChannels()
		console.time('fetchting all users')
		const {
			data: {users},
		} = await supabase.auth.admin.listUsers({perPage: 4000})
		result.users = users
		console.timeEnd('fetchting all users')

		console.time('fetching user channels')
		for (const user of result.users) {
			const {data: channels, error: channelsError} = await supabase
				.from('user_channel')
				.select(` channels ( id, name, slug)`)
				.eq('user_id', user.id)
			if (channelsError) {
				console.error('Error fetching channels for user:', user.id, channelsError)
			} else {
				user.channels = channels.map((channel) => channel.channels)
			}
		}
		console.timeEnd('fetching user channels')

		const {data: orphanedChannels} = await supabase.from('orphaned_channels').select('*')
		result.orphanedChannels = orphanedChannels

		const {data: orphanedTracks} = await supabase.from('orphaned_tracks').select('*')
		result.orphanedTracks = orphanedTracks

		console.log('result', result)
		this.result = result
	}

	/** Deletes a Supabase auth.user AND any channels they are associated with
	 * @arg {string} id */
	async deleteUser(id) {
		const user = this.result.users.find((u) => u.id === id)

		if (!window.confirm(`Really delete user and their data??\n${user.channels.map((c) => `${c.slug}n\n`)}`)) {
			return
		}

		for (const c of user.channels) {
			await this.deleteChannelAndTracks(c)
		}

		const {data, error} = await this.supabase.auth.admin.deleteUser(id)
		console.log(`deleted auth.user`, id, data, error)
	}

	async deleteChannelAndTracks(channel) {
		const res = await this.supabase.from('channels').delete().in('id', [channel.id])
		// Deleting channel doesn't currently delete tracks, so we do it here.
		// If a user deletes their account, tracks ARE deleted because of our Postgres RPC function.
		const {data: tracks} = await sdk.channels.readChannelTracks(channel.slug)
		await this.supabase
			.from('tracks')
			.delete()
			.in('id', [tracks.map((t) => t.id)])
		console.log(`deleted channel @${channel.slug} with ${tracks.length} tracks`, res)
	}

	isPotentiallySpam(user) {
		const domains = [
			'connectmailhub.com',
			'rocketpostbox.com',
			'clearmailhub.com',
			'emailnestpro.com',
			'inboxmasters.com',
			'trustymailpro.com',
		]
		return domains.some((ltd) => user.email.includes(ltd))
	}

	render() {
		const url = this.supabaseUrl
		const key = this.supabaseServiceRoleKey
		if (!url) return html`Missing supabase url`
		if (!key) return html`Missing supabase service role key`
		if (!this.result) return html`<p>Loading. This will take ~30 seconds</p>`
		return html`
			<h2>${this.result.users?.length || 0} users</h2>
			<ul>
				${this.result.users?.map(
					(user) => html`
						<li>
							${this.isPotentiallySpam(user) ? html`🍅` : null} ${user.email}
							<button @click=${() => this.deleteUser(user.id)}>
								Delete user and ${user.channels?.length} channels
							</button>
							<br />
							<em>${user.id}</em>
							<ul>
								${user.channels?.map(
									(x) => html`
										<li>
											<a href="https://radio4000.com/${x.slug}"> ${x.name} (@${x.slug})</a>
										</li>
									`,
								)}
							</ul>
							<hr />
						</li>
					`,
				)}
			</ul>
			<h2>Orphaned channels</h2>
			<ul>
				${this.result.orphanedChannels?.map(
					(x) => html` <li>${x.name} <button @click=${() => {}}>delete</button></li> `,
				)}
			</ul>
			<h2>Orphaned tracks</h2>
			<ul>
				${this.result.orphanedTracks?.map(
					(x) => html` <li>${x.title} <button @click=${() => {}}>delete</button></li> `,
				)}
			</ul>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
