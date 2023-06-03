import { sdk } from '@radio4000/sdk'
import R4List from './r4-list.js'
import { getBrowseParams } from '../libs/browse.js'

const itemTemplate = document.createElement('template')
/* This will set the whole item (track) json,
	 as attribute "track", on the <r4-track/> element */
itemTemplate.setAttribute('element', 'r4-track')
itemTemplate.setAttribute('attribute', 'track')
itemTemplate.innerHTML = `<r4-track></r4-track>`

export default class R4Tracks extends R4List {
	static get observedAttributes() {
		return ['channel', ...R4List.observedAttributes]
	}

	itemTemplate = itemTemplate
	model = 'channel_track'

	select = `
		channel_id!inner(
			slug
		),
		track_id(
			id, created_at, updated_at, url, title, description, tags, mentions
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

	async attributeChangedCallback(attrName) {
		super.attributeChangedCallback(...arguments)
		/* the slug changes, update the list */
		if (['channel'].indexOf(attrName) > -1) {
			await this.updateList()
		}
	}
	/* browse all tracks,or just tracks for a specific channel */
	async browsePage({ page, limit }) {
		/* if there is a channel attribute, even empty */
		if (this.attributes['channel']) {
			/* if it has a value */
			if (this.channel) {
				const browseParams = getBrowseParams({ page, limit })
				return this.browseChannelPage(browseParams)
			} else {
				// noop
				/* do nothing. channel="" attribute is empty,
				 so don't display all tracks, wait for a channel-slug */
			}
		} else {
			/* do nothing if not channel (otherwise there is transicient data) */
		}
	}

	/* browse all tracks for a specific channel slug */
	async browseChannelPage({ from, to, limit }) {
		const res = await sdk.supabase
			.from(this.model)
			.select(this.select)
			.limit(limit)
			.order(this.orderKey, this.orderConfig)
			.eq(this.eq, this.channel) // track specific
			.range(from, to)

		/* serialize junction table response */
		if (res && res.data) {
			res.data = res.data.map((item) => item.track_id)
		}
		return res
	}
}
