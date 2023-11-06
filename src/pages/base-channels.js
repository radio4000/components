import BaseQuery from './base-query.js'

export default class BaseChannels extends BaseQuery {
	static properties = {
		// from router
		config: {type: Object},
		searchParams: {type: Object, state: true},
		// from BaseQuery
		count: {type: Number},
		data: {type: Array},
		query: {type: Object},
	}

	constructor() {
		super()
		this.query = {
			table: 'channels',
		}
	}

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}

	renderHeader() {
		return this.renderQuery()
	}
}
