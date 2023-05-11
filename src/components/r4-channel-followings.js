import R4List from './r4-list.js'
import {sdk} from '@radio4000/sdk'

const itemTemplate = document.createElement('template')
/* This will set the whole item (channel) json,
	 as attribute "track", on the <r4-channel/> element */
itemTemplate.setAttribute('element', 'r4-channel')
itemTemplate.setAttribute('attribute', 'channel')
itemTemplate.innerHTML = `<r4-channel><r4-channel/>`


export default class R4ChannelFollowings extends R4List {
	static get observedAttributes() {
		return ['channel-id', ...R4List.observedAttributes]
	}

	itemTemplate = itemTemplate

	model = 'followers'

	select = `
		channel_id (
			id, name, slug, description, created_at, image, url
		)
	`

	/* specific to track */
	eq = 'follower_id'

	get orderConfig() {
		return { ascending: false }
	}

	/* the channel slug */
	get channelId() {
		return this.getAttribute('channel-id')
	}

	async attributeChangedCallback(attrName) {
		super.attributeChangedCallback(...arguments)
		/* the slug changes, update the list */
		if (['channel-id'].indexOf(attrName) > -1) {
			await this.updateList()
		}
	}
	/* browse all tracks,or just tracks for a specific channel */
	async browsePage({ page, limit }) {
		/* if there is a channel attribute, even empty */
		if (this.attributes['channel-id']) {
			/* if it has a value */
			if (this.channelId) {
				const browseParams = this.getBrowseParams({ page, limit })
				const data = await this.browseChannelFollowersPage(browseParams)
				return data
			}
		}
	}

	/* browse all tracks for a specific channel slug */
	async browseChannelFollowersPage({ from, to, limitResults }) {
		const res = await sdk.supabase
			.from(this.model)
			.select(this.select)
			.limit(limitResults)
			.order(this.orderKey, this.orderConfig)
			.eq(this.eq, this.channelId)
			.range(from, to)

		/* serialize junction table response */
		if (res && res.data) {
			res.data = res.data.map((item) => {
				return item.channel_id
			})
			return res
		}
	}
}
