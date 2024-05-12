import { LitElement, html } from 'lit'
import { createClient } from '@supabase/supabase-js'
// import {sdk} from '../libs/sdk'

/**
 *
 * https://supabase.com/docs/reference/javascript/admin-api
 */
export default class R4Admin extends LitElement {
	static properties = {
		supabaseUrl: { type: String },
		supabaseServiceRoleKey: { type: String },
		result: { type: Object },
		users: { type: Array },
		channels: { type: Array },
	}

	async connectedCallback() {
		super.connectedCallback()
		this.createClient()
		await this.prepareData()
	}

	createClient() {
		const url = this.supabaseUrl
		const key = this.supabaseServiceRoleKey
		if (!url || !key) return
		// Use `this.supabase.auth.admin` for admin stuff.
		this.supabase = createClient(url, key, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			},
		})
		// this.sdk = createSdk(this.supabase)
		window.supabaseAdminClient = this.supabase
	}

	async prepareData() {
		const { supabase } = this
		const result = { users: [], orphanedChannels: [], orphanedTracks: [] }

		// Get users with nested channels.
		// const {data: accounts} = await supabase.from('accounts').select('id')
		// const {data: channels} = await supabase.from('channels').select().limit(4000).order('created_at', {ascending: true})
		// const {data: allChannels} = await sdk.channels.readChannels()
		const { data: { users } } = await supabase.auth.admin.listUsers()
		result.users = users

		for (const user of result.users) {
			const { data: channels, error: channelsError } = await supabase
				.from('user_channel')
				.select(` channels ( id, name, slug)`)
				.eq('user_id', user.id)
			if (channelsError) {
				console.error('Error fetching channels for user:', user.id, channelsError)
			} else {
				user.channels = channels.map(channel => channel.channels)
			}
		}

		const { data: orphanedChannels } = await supabase.from('orphaned_channels').select('*')
		result.orphanedChannels = orphanedChannels

		const { data: orphanedTracks } = await supabase.from('orphaned_tracks').select('*')
		result.orphanedTracks = orphanedTracks

		console.log('result', result)
		this.result = result
	}

	/** Deletes a Supabase auth.user AND any channels they are associated with
	 * @arg {string} id */
	async deleteUser(id) {
		const user = this.result.users.find(u => u.id === id)
		const userChannelIds = user.channels.map(c => c.id)

		if (!window.confirm(`Really delete user and their channels and everything?\n
			${user.channels.map(c => `${c.slug}n\n`)}
			`)) return

		const res = await this.supabase.from('channels').delete().in('id', userChannelIds)
		console.log(`delete the user's channels'`, res)
		const { data, error } = await this.supabase.auth.admin.deleteUser(id)
		console.log(`deleted auth.user`, id, data, error)
	}

	render() {
		const url = this.supabaseUrl
		const key = this.supabaseServiceRoleKey
		if (!url) return html`Missing supabase url`
		if (!key) return html`Missing supabase service role key`
		if (!this.result) return html`<p>Loading</p>`
		return html`
			<h2>${this.result.users?.length || 0} users</h2>
			<ul>
				${this.result.users?.map(user => html`
					<li>${user.email} <button @click=${() => this.deleteUser(user.id)}>Delete user and ${user.channels?.length} channels</button>
						<br/>
						<em>${user.id}</em>
						<ul>
							${user.channels?.map(x => html`
								<li>channel:
								<a href="https://radio4000.com/${x.slug}">
								${x.name} (@${x.slug})</a>
								</li>
							`)}
						</ul>
						<hr/>
					</li>
				`)}
			</ul>
			<h2>Orphaned channels</h2>
			<ul>
				${this.result.orphanedChannels?.map(x => html`
					<li>${x.name} <button @click=${() => { }}>delete</button></li>
				`)}
			</ul>
			<h2>Orphaned tracks</h2>
			<ul>
				${this.result.orphanedTracks?.map(x => html`
					<li>${x.title} <button @click=${() => { }}>delete</button></li>
				`)}
			</ul>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}

