import R4Page from '../components/r4-page.js'

export default class BaseChannels extends R4Page {
	static properties = {
		// from router
		config: {type: Object},
		searchParams: {type: Object, state: true},
	}

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}
}
