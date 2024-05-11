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
		users: {type: Array},
		channels: {type: Array},
		loading: {type: Boolean}
	}

	async connectedCallback() {
		super.connectedCallback()
		this.createClient()
		await this.prepareData()
		this.loading = false
	}

	async prepareData() {
		// const {data: {users}} = await this.supabase.auth.admin.listUsers()
		// this.users = users
		// console.log(this.users)
		// const {data: channels} = await this.supabase.from('channels').select().limit(4000).order('created_at', {ascending: true})
		// const {data: channels} = await sdk.channels.readChannels()
		// this.channels = channels
		// console.log(this.channels)
		//
		//

		const { data: users, error: usersError } = await this.supabase
			.from('accounts')
			.select('id');

		if (usersError) {
			console.error('Error fetching users:', usersError);
		} else {
			const result = { users: [] };

			for (const user of users) {
				const { data: channels, error: channelsError } = await this.supabase
					.from('user_channel')
					.select(` channels ( id, name, slug) `)
					.eq('user_id', user.id);
				if (channelsError) {
					console.error('Error fetching channels for user:', user.id, channelsError);
				} else {
					result.users.push({
						id: user.id,
						channels: channels.map(channel => channel.channels),
					})
				}
			}
			console.log(result)
			this.users = result.users
		}
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
	}

	/** Deletes a Supabase auth.user AND any channels they are associated with */
	async deleteUser(id) {
		const user = this.users.find(u => u.id === id)
		for (const c of user.channels) {
			this.supabase.from('channels').delete().eq('id', c.id)
			console.log('deleted channel', c)
		}

		const { data, error } = await this.supabase.auth.admin.deleteUser(id)
		console.log('deleted user?', data, error)
	}

	render() {
		const url = this.supabaseUrl
		const key = this.supabaseServiceRoleKey
		if (!url) return html`Missing supabase url`
		if (!key) return html`Missing supabase service role key`
		if (this.loading) return html`<p>Loading</p>`
		return html`
			<h2>${this.users?.length || 0} users</h2>
			<ul>
				${this.users?.map(user => html`
					<li>${user.id}
						<menu>
							<button @click=${() => this.deleteUser(user.id)}>Delete user</button>
						</menu>
						<hr/>
						<h3>${user.channels?.length} channels</h3>
						<ul>
							${user.channels?.map(x => html`
								<li>${x.name}
									<menu>
										<button @click=${() => {}}>todo</button>
									</menu>
								</li>
							`)}
						</ul>
					</li>
				`)}
			</ul>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}

