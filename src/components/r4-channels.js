import R4List from './r4-list.js'

const template = document.createElement('template')
template.setAttribute('element', 'r4-channel-card')
template.setAttribute('property', 'channel')
template.innerHTML = `<r4-channel-card></r4-channel-card>`

export default class R4ListChannels extends R4List {
	itemTemplate = template
	model = 'channels'
	select = '*'

	/*
		 Could also use
		 itemTemplate.innerHTML = `<r4-channel slug><r4-channel/>`
		 and just `select` the `slug` in the query,
		 to have the r4-channel fetch the channel data itself,
		 and this list only answer for the `slug` of all channels
	 */
	/* select = 'slug' */
}
