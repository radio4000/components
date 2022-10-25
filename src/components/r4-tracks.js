import R4List from './r4-list.js'
import sdk from '@radio4000/sdk'

const itemTemplate = document.createElement('template')
itemTemplate.setAttribute('element', 'r4-track')
itemTemplate.setAttribute('element', 'r4-track')
itemTemplate.innerHTML = `<r4-track id=""><r4-track/>`

export default class R4Tracks extends R4List {
	itemTemplate = itemTemplate
	model = 'channel_track'

	select = `
		channel_id!inner(
			slug
		),
		track_id(
			id, created_at, updated_at, title, url, description
		)
	`

	/* specific to track */
	eq = 'channel_id.slug'

	get orderConfig() {
		return { ascending: false }
	}

	/* the channel slug */
	get channel() {
		return this.getAttribute('channel')
	}

	/* browse all tracks,
		 or channel tracks */
	async browsePage({ page, limit }) {
		if (Boolean(this.channel)) {
			const browseParams = this.getBrowseParams({ page, limit })
			return this.browseChannelPage(browseParams)
		} else {
			return super.browsePage({ page, limit })
		}
	}
	async browseChannelPage({ from, to, limitResults }) {
		const res = await sdk.supabase
			.from(this.model)
			.select(this.select)
			.limit(limitResults)
			.order(this.orderKey, this.orderConfig)
			.eq(this.eq, this.channel) // track specific
			.range(from, to)

		if (res && res.data) {
			res.data = res.data.map(item => item.track_id)
		}
		return res
	}
}
